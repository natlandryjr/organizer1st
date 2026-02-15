import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { SeatStatus } from "@prisma/client";
import { sendEmail, isEmailConfigured } from "@/lib/email";
import { generateQrDataUrl } from "@/lib/qrcode";

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

    const body = (await request.json()) as { session_id: string; event_id?: string };
    const { session_id, event_id } = body;

    if (!session_id || typeof session_id !== "string" || session_id.trim() === "") {
      return NextResponse.json(
        { error: "session_id is required" },
        { status: 400 }
      );
    }

    // For Stripe Connect, session is on the connected account - we need event_id to get stripeAccountId
    let stripeAccountId: string | null = null;
    if (event_id) {
      const event = await prisma.event.findUnique({
        where: { id: event_id },
        select: { organization: { select: { stripeAccountId: true } } },
      });
      stripeAccountId = event?.organization?.stripeAccountId ?? null;
    }

    let session: Stripe.Checkout.Session;
    try {
      if (stripeAccountId) {
        session = await stripe.checkout.sessions.retrieve(session_id, {
          stripeAccount: stripeAccountId,
        });
      } else {
        session = await stripe.checkout.sessions.retrieve(session_id);
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 400 }
      );
    }

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment has not been completed" },
        { status: 400 }
      );
    }

    const sessionMetadata = session.metadata;
    if (!sessionMetadata?.seatIds) {
      return NextResponse.json(
        { error: "Invalid session: missing booking data" },
        { status: 400 }
      );
    }

    const eventId = sessionMetadata.eventId as string | undefined;
    if (!eventId) {
      return NextResponse.json(
        { error: "Invalid session: missing event" },
        { status: 400 }
      );
    }

    let seatIds: string[];
    try {
      seatIds = JSON.parse(sessionMetadata.seatIds) as string[];
    } catch {
      return NextResponse.json(
        { error: "Invalid session: invalid seat data" },
        { status: 400 }
      );
    }

    const name = (sessionMetadata.attendeeName as string)?.trim() || "";
    const email = (sessionMetadata.attendeeEmail as string)?.trim() || "";

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

    let emailSent = false;
    if (isEmailConfigured() && booking) {
      try {
        const event = await prisma.event.findUnique({
          where: { id: eventId },
          select: { name: true, date: true, location: true },
        });
        const qrDataUrl = await generateQrDataUrl(booking.id, 220);
        const seatLabels = booking.seats
          .map((s) => {
            if (s.section) return `${s.section.name}, Seat ${s.seatNumber}`;
            if (s.table) return `${s.table.name}, Seat ${s.seatNumber}`;
            return `Seat ${s.seatNumber}`;
          })
          .join(", ");
        const eventDate = event?.date
          ? new Date(event.date).toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })
          : "";
        const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1f2937;background:#f9fafb;">
  <div style="background:#fff;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <h1 style="margin:0 0 8px;font-size:1.5rem;color:#111827;">You're all set!</h1>
    <p style="margin:0 0 20px;color:#6b7280;">Thank you, ${booking.attendeeName}. Your booking is confirmed.</p>
    ${event ? `
    <div style="margin-bottom:20px;padding:16px;background:#f3f4f6;border-radius:8px;">
      <p style="margin:0 0 4px;font-weight:600;color:#374151;">${event.name}</p>
      ${eventDate ? `<p style="margin:0 0 4px;font-size:0.9rem;color:#6b7280;">${eventDate}</p>` : ""}
      ${event.location ? `<p style="margin:0;font-size:0.9rem;color:#6b7280;">${event.location}</p>` : ""}
    </div>
    ` : ""}
    <p style="margin:0 0 8px;font-size:0.875rem;color:#6b7280;">Your seats: ${seatLabels}</p>
    <p style="margin:0 0 16px;font-size:0.75rem;color:#9ca3af;">Booking ref: #${booking.id.slice(-8).toUpperCase()}</p>
    <p style="margin:0 0 12px;font-size:0.875rem;font-weight:600;color:#374151;">Present this QR code at check-in:</p>
    <div style="text-align:center;padding:16px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;">
      <img src="${qrDataUrl}" alt="Ticket QR Code" width="220" height="220" style="display:block;margin:0 auto;" />
    </div>
    <p style="margin:16px 0 0;font-size:0.75rem;color:#9ca3af;">Save this email or take a screenshot to show at the door.</p>
  </div>
</body>
</html>`;
        await sendEmail(booking.attendeeEmail, `Booking confirmed – ${event?.name ?? "Event"}`, html, true);
        emailSent = true;
      } catch (err) {
        console.error("Failed to send confirmation email:", err);
        // Don't fail the booking - email is best-effort
      }
    }

    return NextResponse.json({ ...booking, emailSent });
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
