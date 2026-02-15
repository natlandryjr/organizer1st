import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    const events = await prisma.event.findMany({
      where: { organizationId },
      select: { id: true, name: true },
    });
    const ids = events.map((e) => e.id);
    const eventNameMap = new Map(events.map((e) => [e.id, e.name]));

    const venueMaps = await prisma.venueMap.findMany({
      where: { eventId: { in: ids } },
      select: { id: true },
    });
    const venueMapIds = venueMaps.map((v) => v.id);

    const bookings = await prisma.booking.findMany({
      where: {
        seats: {
          some: {
            OR: [
              { section: { venueMapId: { in: venueMapIds } } },
              { table: { venueMapId: { in: venueMapIds } } },
            ],
          },
        },
      },
      include: {
        seats: {
          include: {
            section: { include: { ticketType: true, venueMap: { select: { eventId: true } } } },
            table: { include: { ticketType: true, venueMap: { select: { eventId: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const orders = bookings.map((b) => {
      let amountCents = 0;
      for (const seat of b.seats) {
        const tt = seat.section?.ticketType ?? seat.table?.ticketType;
        amountCents += tt?.price ?? 5000;
      }
      const eventId = b.seats[0]?.section?.venueMap?.eventId ?? b.seats[0]?.table?.venueMap?.eventId;
      return {
        id: b.id,
        orderId: b.id.slice(-8).toUpperCase(),
        customerName: b.attendeeName,
        amountCents,
        amount: (amountCents / 100).toFixed(2),
        date: b.createdAt,
        eventId: eventId ?? null,
        eventName: eventId ? eventNameMap.get(eventId) ?? null : null,
      };
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Admin orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
