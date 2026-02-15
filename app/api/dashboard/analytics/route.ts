import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getCookieName } from "@/lib/auth";

export const dynamic = "force-dynamic";

type BookingWithSeats = {
  id: string;
  createdAt: Date;
  seats: {
    section: { ticketType: { price: number } | null; venueMap: { eventId: string } } | null;
    table: { ticketType: { price: number } | null; venueMap: { eventId: string } } | null;
  }[];
};

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
      select: { id: true, eventId: true },
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
    }) as BookingWithSeats[];

    const DEFAULT_PRICE = 5000;

    let totalRevenueCents = 0;
    let ticketsSold = 0;
    const revenueByDate = new Map<string, number>();
    const ticketsByEvent = new Map<string, number>();
    const revenueByEvent = new Map<string, number>();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    for (const b of bookings) {
      for (const seat of b.seats) {
        const tt = seat.section?.ticketType ?? seat.table?.ticketType;
        const priceCents = tt?.price ?? DEFAULT_PRICE;
        const eventId = seat.section?.venueMap?.eventId ?? seat.table?.venueMap?.eventId;

        totalRevenueCents += priceCents;
        ticketsSold += 1;

        if (eventId) {
          ticketsByEvent.set(eventId, (ticketsByEvent.get(eventId) ?? 0) + 1);
          revenueByEvent.set(eventId, (revenueByEvent.get(eventId) ?? 0) + priceCents);
        }

        if (b.createdAt >= thirtyDaysAgo) {
          const dateKey = b.createdAt.toISOString().slice(0, 10);
          revenueByDate.set(dateKey, (revenueByDate.get(dateKey) ?? 0) + priceCents);
        }
      }
    }

    const revenueOverTime: { date: string; revenue: number; revenueFormatted: string }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dateKey = d.toISOString().slice(0, 10);
      const cents = revenueByDate.get(dateKey) ?? 0;
      revenueOverTime.push({
        date: dateKey,
        revenue: cents / 100,
        revenueFormatted: `$${(cents / 100).toFixed(2)}`,
      });
    }

    const ticketsByEventData = Array.from(ticketsByEvent.entries()).map(([eventId, count]) => ({
      eventId,
      eventName: eventMap.get(eventId) ?? "Unknown",
      ticketsSold: count,
    }));

    const topEvents = Array.from(revenueByEvent.entries())
      .map(([eventId, cents]) => ({
        eventId,
        eventName: eventMap.get(eventId) ?? "Unknown",
        totalSalesCents: cents,
        totalSales: (cents / 100).toFixed(2),
        ticketsSold: ticketsByEvent.get(eventId) ?? 0,
      }))
      .sort((a, b) => b.totalSalesCents - a.totalSalesCents)
      .slice(0, 5);

    const averageTicketPriceCents = ticketsSold > 0 ? Math.round(totalRevenueCents / ticketsSold) : 0;

    return NextResponse.json({
      metrics: {
        totalRevenueCents,
        totalRevenue: (totalRevenueCents / 100).toFixed(2),
        ticketsSold,
        numberOfEvents: ids.length,
        averageTicketPriceCents,
        averageTicketPrice: (averageTicketPriceCents / 100).toFixed(2),
      },
      revenueOverTime,
      ticketsByEvent: ticketsByEventData,
      topEvents,
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
