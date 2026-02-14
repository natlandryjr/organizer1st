import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId is required" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { venueMap: true },
    });

    if (!event?.venueMap) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
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
            section: true,
            table: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const attendees = bookings.map((b) => ({
      id: b.id,
      attendeeName: b.attendeeName,
      attendeeEmail: b.attendeeEmail,
      createdAt: b.createdAt,
      seatCount: b.seats.length,
      seats: b.seats.map((s) => ({
        id: s.id,
        seatNumber: s.seatNumber,
        sectionName: s.section?.name,
        tableName: s.table?.name,
      })),
    }));

    return NextResponse.json(attendees);
  } catch (error) {
    console.error("List attendees error:", error);
    return NextResponse.json(
      { error: "Failed to list attendees" },
      { status: 500 }
    );
  }
}
