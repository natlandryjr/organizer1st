/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { SeatStatus } from "@prisma/client";

const PLATFORM_FEE_PERCENT = 0.01; // 1%
const PLATFORM_FEE_CENTS_PER_TICKET = 50; // $0.50 per ticket
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const DEFAULT_PRICE_CENTS = 5000; // $50 fallback when no ticket type

type CheckoutPayload = {
  seatIds: string[];
  eventId: string;
  name?: string;
  email?: string;
  promoCode?: string;
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

    const { seatIds, eventId, name, email, promoCode } = body;

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
      include: {
        hold: true,
        section: { include: { ticketType: true } },
        table: { include: { ticketType: true } },
      },
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

    // Check max seating / overselling and get organization Stripe account
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        venueMap: true,
        organization: { select: { stripeAccountId: true } },
      },
    });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    const stripeAccountId = event.organization?.stripeAccountId;
    if (!stripeAccountId) {
      return NextResponse.json(
        { error: "Event organizer has not connected Stripe. Please contact the organizer." },
        { status: 400 }
      );
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

    // Compute price per seat from ticket type (section or table)
    let subtotalCents = 0;
    for (const seat of seats) {
      const ticketType = seat.section?.ticketType ?? seat.table?.ticketType;
      const priceCents = ticketType?.price ?? DEFAULT_PRICE_CENTS;
      subtotalCents += priceCents;
    }

    // Validate and apply promo code
    let discountCents = 0;
    let appliedPromoCode: string | null = null;
    if (promoCode?.trim()) {
      const promo = await prisma.promoCode.findFirst({
        where: { eventId, code: promoCode.trim().toUpperCase() },
      });
      if (promo) {
        appliedPromoCode = promo.code;
        if (promo.discountType === "PERCENT") {
          discountCents = Math.round(
            subtotalCents * Math.min(100, Math.max(0, promo.discountValue)) / 100
          );
        } else {
          discountCents = Math.min(subtotalCents, promo.discountValue);
        }
      }
    }

    const totalAmountCents = Math.max(0, subtotalCents - discountCents);
    const feeFromPercent = Math.round(totalAmountCents * PLATFORM_FEE_PERCENT);
    const feeFromFlat = PLATFORM_FEE_CENTS_PER_TICKET * quantity;
    const applicationFeeAmount = Math.max(feeFromPercent, feeFromFlat);

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Event Ticket",
                description:
                  discountCents > 0
                    ? `${quantity} seat${quantity !== 1 ? "s" : ""} (promo applied)`
                    : `${quantity} seat${quantity !== 1 ? "s" : ""}`,
              },
              unit_amount: totalAmountCents,
            },
            quantity: 1,
          },
        ],
        payment_intent_data: {
          application_fee_amount: applicationFeeAmount,
        },
        success_url: `${BASE_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}&event_id=${eventId}`,
        cancel_url: `${BASE_URL}/events/${eventId}`,
        metadata: {
          seatIds: JSON.stringify(seatIds),
          eventId,
          ...(name && { attendeeName: name }),
          ...(email && { attendeeEmail: email }),
          ...(appliedPromoCode && { promoCode: appliedPromoCode }),
        },
        ...(email && { customer_email: email }),
      },
      { stripeAccount: stripeAccountId }
    );

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
