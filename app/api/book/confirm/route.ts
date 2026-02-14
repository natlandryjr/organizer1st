import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { SeatStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);

    const body = (await request.json()) as { session_id: string };
    const { session_id } = body;

    if (!session_id || typeof session_id !== "string" || session_id.trim() === "") {
      return NextResponse.json(
        { error: "session_id is required" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment has not been completed" },
        { status: 400 }
      );
    }

    const metadata = session.metadata;
    if (!metadata?.seatIds) {
      return NextResponse.json(
        { error: "Invalid session: missing booking data" },
        { status: 400 }
      );
    }

    const eventId = metadata.eventId as string | undefined;
    if (!eventId) {
      return NextResponse.json(
        { error: "Invalid session: missing event" },
        { status: 400 }
      );
    }

    let seatIds: string[];
    try {
      seatIds = JSON.parse(metadata.seatIds) as string[];
    } catch {
      return NextResponse.json(
        { error: "Invalid session: invalid seat data" },
        { status: 400 }
      );
    }

    const name = (metadata.attendeeName as string)?.trim() || "";
    const email = (metadata.attendeeEmail as string)?.trim() || "";

    if (!name || !email) {
      return NextResponse.json(
        { error: "Invalid session: missing attendee information" },
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

      // Check max seating / overselling before confirming
      const event = await tx.event.findUnique({
        where: { id: eventId },
        include: { venueMap: true },
      });
      if (event?.maxSeats != null && event.maxSeats > 0 && event.venueMap) {
        const bookedCount = await tx.seat.count({
          where: {
            status: SeatStatus.BOOKED,
            OR: [
              { section: { venueMapId: event.venueMap.id } },
              { table: { venueMapId: event.venueMap.id } },
            ],
          },
        });
        if (bookedCount + seatIds.length > event.maxSeats) {
          throw new Error(
            `Event is at capacity. ${bookedCount} of ${event.maxSeats} seats sold. Cannot add ${seatIds.length} more.`
          );
        }
      }

      const heldSeats = seats.filter((s) => s.status === SeatStatus.HELD);
      if (heldSeats.length > 0) {
        throw new Error(
          `Seat(s) are on hold. Please select different seats.`
        );
      }

      const alreadyBooked = seats.filter((s) => s.status === SeatStatus.BOOKED);
      if (alreadyBooked.length > 0) {
        const bookingId = alreadyBooked[0].bookingId;
        if (bookingId) {
          const existingBooking = await tx.booking.findUnique({
            where: { id: bookingId },
            include: {
              seats: {
                include: {
                  section: true,
                  table: true,
                },
              },
            },
          });
          if (existingBooking) return existingBooking;
        }
        throw new Error(
          `Seat(s) already booked: ${alreadyBooked.map((s) => s.seatNumber).join(", ")}`
        );
      }

      const newBooking = await tx.booking.create({
        data: {
          attendeeName: name,
          attendeeEmail: email,
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
        include: {
          seats: {
            include: {
              section: true,
              table: true,
            },
          },
        },
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
      if (error.message.includes("invalid") || error.message.includes("Invalid")) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    console.error("Book confirm API error:", error);
    return NextResponse.json(
      { error: "Failed to confirm booking" },
      { status: 500 }
    );
  }
}
