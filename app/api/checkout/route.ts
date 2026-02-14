/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

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
