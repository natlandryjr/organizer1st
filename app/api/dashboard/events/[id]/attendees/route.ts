import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getCookieName } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get(getCookieName())?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: eventId } = await params;

  try {
    const event = await prisma.event.findFirst({
      where: { id: eventId, organizationId: payload.organizationId },
      include: { venueMap: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!event.venueMap) {
      return NextResponse.json({
        attendees: [],
        event: { id: event.id, name: event.name },
        message: "Event has no venue map",
      });
    }

    const venueMapId = event.venueMap.id;

    const bookings = await prisma.booking.findMany({
      where: {
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
      orderBy: { createdAt: "desc" },
    });

    const attendees = bookings.map((b) => {
      const ticketTypes = Array.from(
        new Set(
          b.seats
            .map((s) => s.section?.ticketType?.name ?? s.table?.ticketType?.name ?? "General")
            .filter(Boolean)
        )
      );
      return {
        id: b.id,
        name: b.attendeeName,
        email: b.attendeeEmail,
        ticketType: ticketTypes.length === 1 ? ticketTypes[0] : ticketTypes.join(", "),
        orderNumber: b.id.slice(-8).toUpperCase(),
        createdAt: b.createdAt,
        checkedInAt: b.checkedInAt,
      };
    });

    return NextResponse.json({ attendees, event: { id: event.id, name: event.name } });
  } catch (error) {
    console.error("Attendees API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendees" },
      { status: 500 }
    );
  }
}
