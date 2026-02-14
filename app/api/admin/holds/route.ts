import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SeatStatus } from "@prisma/client";

type CreateHoldPayload = {
  eventId: string;
  seatIds: string[];
  label: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateHoldPayload;
    const { eventId, seatIds, label } = body;

    if (!eventId || !seatIds?.length || !label?.trim()) {
      return NextResponse.json(
        { error: "eventId, seatIds, and label are required" },
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
      include: {
        section: true,
        table: true,
      },
    });

    // Verify all seats belong to this event's venue
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

    // Check all seats are available
    const unavailable = seats.filter((s) => s.status !== SeatStatus.AVAILABLE);
    if (unavailable.length > 0) {
      return NextResponse.json(
        {
          error: `Seat(s) not available: ${unavailable.map((s) => s.seatNumber).join(", ")}`,
        },
        { status: 400 }
      );
    }

    const hold = await prisma.$transaction(async (tx) => {
      const newHold = await tx.hold.create({
        data: { label: label.trim() },
      });

      await tx.seat.updateMany({
        where: { id: { in: seatIds } },
        data: { status: SeatStatus.HELD, holdId: newHold.id },
      });

      return tx.hold.findUnique({
        where: { id: newHold.id },
        include: { seats: true },
      });
    });

    return NextResponse.json(hold);
  } catch (error) {
    console.error("Create hold error:", error);
    return NextResponse.json(
      { error: "Failed to create hold" },
      { status: 500 }
    );
  }
}
