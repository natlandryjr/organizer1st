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

  const { id } = await params;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        seats: {
          include: {
            section: {
              include: {
                ticketType: true,
                venueMap: { include: { event: { select: { id: true, name: true } } } },
              },
            },
            table: {
              include: {
                ticketType: true,
                venueMap: { include: { event: { select: { id: true, name: true } } } },
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const seatEventId = booking.seats[0]?.section?.venueMap?.eventId ?? booking.seats[0]?.table?.venueMap?.eventId;
    if (!seatEventId) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const event = await prisma.event.findFirst({
      where: { id: seatEventId, organizationId: payload.organizationId },
      select: { id: true, name: true },
    });
    if (!event) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const items = booking.seats.map((s) => {
      const section = s.section;
      const table = s.table;
      const ticketType = section?.ticketType ?? table?.ticketType;
      const priceCents = ticketType?.price ?? 5000;
      return {
        seatNumber: s.seatNumber,
        location: section ? `${section.name}, Seat ${s.seatNumber}` : table ? `${table.name}, Seat ${s.seatNumber}` : s.seatNumber,
        ticketType: ticketType?.name ?? "General Admission",
        priceCents,
        price: (priceCents / 100).toFixed(2),
      };
    });

    const totalCents = items.reduce((sum, i) => sum + i.priceCents, 0);

    return NextResponse.json({
      order: {
        id: booking.id,
        orderNumber: booking.id.slice(-8).toUpperCase(),
        customerName: booking.attendeeName,
        customerEmail: booking.attendeeEmail,
        date: booking.createdAt,
        totalCents,
        total: (totalCents / 100).toFixed(2),
        event: { id: event.id, name: event.name },
      },
      items,
    });
  } catch (error) {
    console.error("Order detail API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
