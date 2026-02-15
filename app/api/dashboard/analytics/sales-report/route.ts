import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getCookieName } from "@/lib/auth";

export const dynamic = "force-dynamic";

const DEFAULT_PRICE = 5000;

export async function GET(request: NextRequest) {
  const token = request.cookies.get(getCookieName())?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const eventIds = await prisma.event.findMany({
      where: { organizationId: payload.organizationId },
      select: { id: true, name: true },
    });
    const ids = eventIds.map((e) => e.id);
    const eventMap = new Map(eventIds.map((e) => [e.id, e.name]));

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

    const sales = bookings.map((b) => {
      let amountCents = 0;
      let eventId: string | null = null;
      for (const seat of b.seats) {
        const tt = seat.section?.ticketType ?? seat.table?.ticketType;
        amountCents += tt?.price ?? DEFAULT_PRICE;
        eventId = seat.section?.venueMap?.eventId ?? seat.table?.venueMap?.eventId ?? eventId;
      }
      return {
        orderId: b.id.slice(-8).toUpperCase(),
        date: b.createdAt.toISOString(),
        customerName: b.attendeeName,
        customerEmail: b.attendeeEmail,
        eventName: eventId ? eventMap.get(eventId) ?? "Unknown" : "Unknown",
        amount: (amountCents / 100).toFixed(2),
        ticketsSold: b.seats.length,
      };
    });

    return NextResponse.json({ sales });
  } catch (error) {
    console.error("Sales report API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales report" },
      { status: 500 }
    );
  }
}
