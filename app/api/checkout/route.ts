/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { SeatStatus } from "@prisma/client";

const PRICE_PER_SEAT_CENTS = 5000; // $50.00
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

type CheckoutPayload = {
  seatIds: string[];
  eventId: string;
  name?: string;
  email?: string;
};

export async function POST(request: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY is not configured");
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);

    const body = (await request.json()) as CheckoutPayload;

    const { seatIds, eventId, name, email } = body;

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return NextResponse.json(
        { error: "seatIds must be a non-empty array" },
        { status: 400 }
      );
    }

    if (!eventId || typeof eventId !== "string" || eventId.trim() === "") {
      return NextResponse.json(
        { error: "eventId is required" },
        { status: 400 }
      );
    }

    const quantity = seatIds.length;

    // Verify seats exist and are available (not booked or held)
    const seats = await prisma.seat.findMany({
      where: { id: { in: seatIds } },
      include: { hold: true },
    });
    if (seats.length !== seatIds.length) {
      return NextResponse.json(
        { error: "One or more seat IDs are invalid" },
        { status: 400 }
      );
    }
    const heldSeats = seats.filter((s) => s.status === SeatStatus.HELD);
    if (heldSeats.length > 0) {
      const labels = Array.from(new Set(heldSeats.map((s) => s.hold?.label).filter((l): l is string => Boolean(l))));
      return NextResponse.json(
        {
          error: `Seat(s) are on hold${labels.length ? ` for: ${labels.join(", ")}` : ""}. Please select different seats.`,
        },
        { status: 400 }
      );
    }
    const bookedSeats = seats.filter((s) => s.status === SeatStatus.BOOKED);
    if (bookedSeats.length > 0) {
      return NextResponse.json(
        { error: "One or more seats are already booked" },
        { status: 400 }
      );
    }

    // Check max seating / overselling
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { venueMap: true },
    });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    if (event.maxSeats != null && event.maxSeats > 0 && event.venueMap) {
      const bookedCount = await prisma.seat.count({
        where: {
          status: SeatStatus.BOOKED,
          OR: [
            { section: { venueMapId: event.venueMap.id } },
            { table: { venueMapId: event.venueMap.id } },
          ],
        },
      });
      if (bookedCount + quantity > event.maxSeats) {
        return NextResponse.json(
          {
            error: `Event is at capacity. ${bookedCount} of ${event.maxSeats} seats sold. Cannot add ${quantity} more.`,
          },
          { status: 400 }
        );
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Event Ticket",
              description: `${quantity} seat${quantity !== 1 ? "s" : ""} @ $50 each`,
            },
            unit_amount: PRICE_PER_SEAT_CENTS,
          },
          quantity,
        },
      ],
      success_url: `${BASE_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/events/${eventId}`,
      metadata: {
        seatIds: JSON.stringify(seatIds),
        eventId,
        ...(name && { attendeeName: name }),
        ...(email && { attendeeEmail: email }),
      },
      ...(email && { customer_email: email }),
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url ?? null,
    });
  } catch (error) {
    console.error("Checkout API error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
