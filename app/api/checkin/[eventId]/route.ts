import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getCookieName } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const token = request.cookies.get(getCookieName())?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;

  try {
    const body = (await request.json()) as { ticketId?: string };
    const ticketId = body.ticketId?.trim();

    if (!ticketId) {
      return NextResponse.json(
        { error: "Ticket ID is required" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findFirst({
      where: { id: eventId, organizationId: payload.organizationId },
      include: { venueMap: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!event.venueMap) {
      return NextResponse.json(
        { error: "Event has no venue map" },
        { status: 400 }
      );
    }

    const venueMapId = event.venueMap.id;

    const booking = await prisma.booking.findFirst({
      where: {
        id: ticketId,
        seats: {
          some: {
            OR: [
              { section: { venueMapId } },
              { table: { venueMapId } },
            ],
          },
        },
      },
      include: {
        seats: {
          include: {
            section: { include: { ticketType: true } },
            table: { include: { ticketType: true } },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired ticket" },
        { status: 404 }
      );
    }

    if (booking.checkedInAt) {
      return NextResponse.json({
        success: false,
        error: "Already checked in",
        attendeeName: booking.attendeeName,
        ticketType: getTicketType(booking),
      }, { status: 409 });
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: { checkedInAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      attendeeName: booking.attendeeName,
      ticketType: getTicketType(booking),
    });
  } catch (error) {
    console.error("Check-in API error:", error);
    return NextResponse.json(
      { error: "Failed to process check-in" },
      { status: 500 }
    );
  }
}

function getTicketType(booking: {
  seats: Array<{
    section?: { ticketType?: { name: string } | null } | null;
    table?: { ticketType?: { name: string } | null } | null;
  }>;
}): string {
  const types = Array.from(
    new Set(
      booking.seats
        .map((s) => s.section?.ticketType?.name ?? s.table?.ticketType?.name ?? "General")
        .filter(Boolean)
    )
  );
  return types.length === 1 ? types[0]! : types.join(", ");
}
