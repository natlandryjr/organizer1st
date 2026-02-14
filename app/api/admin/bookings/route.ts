import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SeatStatus } from "@prisma/client";

type CreateBookingPayload = {
  eventId: string;
  seatIds: string[];
  attendeeName: string;
  attendeeEmail: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateBookingPayload;
    const { eventId, seatIds, attendeeName, attendeeEmail } = body;

    if (!eventId || !seatIds?.length || !attendeeName?.trim() || !attendeeEmail?.trim()) {
      return NextResponse.json(
        { error: "eventId, seatIds, attendeeName, and attendeeEmail are required" },
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

    const seats = await prisma.seat.findMany({
      where: { id: { in: seatIds } },
      include: { section: true, table: true },
    });

    const invalidSeats = seats.filter(
      (s) =>
        (s.section?.venueMapId ?? s.table?.venueMapId) !== venueMapId
    );
    if (invalidSeats.length > 0 || seats.length !== seatIds.length) {
      return NextResponse.json(
        {
          error:
            seats.length !== seatIds.length
              ? "One or more seat IDs are invalid"
              : "One or more seats do not belong to this event",
        },
        { status: 400 }
      );
    }

    const unavailable = seats.filter(
      (s) => s.status !== SeatStatus.AVAILABLE && s.status !== SeatStatus.HELD
    );
    if (unavailable.length > 0) {
      return NextResponse.json(
        {
          error: `Seat(s) not available: ${unavailable.map((s) => s.seatNumber).join(", ")}`,
        },
        { status: 400 }
      );
    }

    const booking = await prisma.$transaction(async (tx) => {
      await tx.seat.updateMany({
        where: { id: { in: seatIds } },
        data: { holdId: null },
      });

      const newBooking = await tx.booking.create({
        data: {
          attendeeName: attendeeName.trim(),
          attendeeEmail: attendeeEmail.trim(),
        },
      });

      await tx.seat.updateMany({
        where: { id: { in: seatIds } },
        data: { status: SeatStatus.BOOKED, bookingId: newBooking.id },
      });

      return tx.booking.findUnique({
        where: { id: newBooking.id },
        include: {
          seats: { include: { section: true, table: true } },
        },
      });
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
