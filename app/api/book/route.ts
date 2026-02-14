import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SeatStatus } from "@prisma/client";

type BookPayload = {
  seatIds: string[];
  name: string;
  email: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BookPayload;

    const { seatIds, name, email } = body;

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return NextResponse.json(
        { error: "seatIds must be a non-empty array" },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || email.trim() === "") {
      return NextResponse.json(
        { error: "email is required" },
        { status: 400 }
      );
    }

    const booking = await prisma.$transaction(async (tx) => {
      const seats = await tx.seat.findMany({
        where: { id: { in: seatIds } },
      });

      if (seats.length !== seatIds.length) {
        throw new Error("One or more seat IDs are invalid");
      }

      const alreadyBooked = seats.filter((s) => s.status === SeatStatus.BOOKED);
      if (alreadyBooked.length > 0) {
        throw new Error(
          `Seat(s) already booked: ${alreadyBooked.map((s) => s.seatNumber).join(", ")}`
        );
      }

      const newBooking = await tx.booking.create({
        data: {
          attendeeName: name.trim(),
          attendeeEmail: email.trim(),
        },
      });

      await tx.seat.updateMany({
        where: { id: { in: seatIds } },
        data: {
          status: SeatStatus.BOOKED,
          bookingId: newBooking.id,
        },
      });

      return tx.booking.findUnique({
        where: { id: newBooking.id },
        include: { seats: true },
      });
    });

    return NextResponse.json(booking);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("already booked")) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
      if (error.message.includes("invalid")) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    console.error("Book API error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
