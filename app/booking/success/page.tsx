"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";

type Seat = {
  id: string;
  seatNumber: string;
  status: string;
  sectionId: string | null;
  tableId: string | null;
  section?: { name: string } | null;
  table?: { name: string } | null;
};

type Booking = {
  id: string;
  attendeeName: string;
  attendeeEmail: string;
  createdAt: string;
  seats: Seat[];
};

function getSeatLabel(seat: Seat): string {
  if (seat.section) {
    return `${seat.section.name}, Seat ${seat.seatNumber}`;
  }
  if (seat.table) {
    return `${seat.table.name}, Seat ${seat.seatNumber}`;
  }
  return `Seat ${seat.seatNumber}`;
}

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("Missing session ID");
      setLoading(false);
      return;
    }

    async function confirmBooking() {
      try {
        const res = await fetch("/api/book/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to confirm booking");
        }

        setBooking(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    confirmBooking();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-zinc-400">Confirming your booking...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-zinc-50">Booking Error</h1>
        <p className="text-red-400">{error}</p>
        <Link
          href="/"
          className="inline-block text-amber-500 hover:text-amber-400"
        >
          Return to home
        </Link>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <svg className="h-10 w-10 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx={12} cy={12} r={10} />
          <path d="m9 12 2 2 4-4" />
        </svg>
        <h1 className="text-2xl font-bold text-zinc-50">
          Booking confirmed!
        </h1>
      </div>
      <p className="text-zinc-400">
        Thank you, <span className="text-zinc-200">{booking.attendeeName}</span>! A confirmation has been sent to{" "}
        <span className="text-zinc-300">{booking.attendeeEmail}</span>.
      </p>
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
        <p className="text-sm text-zinc-500">
          Booking reference: <span className="font-mono text-zinc-300">#{booking.id.slice(-8)}</span>
        </p>
        <h2 className="text-lg font-semibold text-zinc-300">
          Confirmed seats
        </h2>
        <ul className="space-y-1 text-zinc-300">
          {booking.seats.map((seat) => (
            <li key={seat.id}>{getSeatLabel(seat)}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
        <h3 className="mb-2 text-sm font-medium text-zinc-300">What&apos;s next?</h3>
        <ul className="space-y-1 text-sm text-zinc-500">
          <li>Check your email for your booking confirmation</li>
          <li>Arrive at least 15 minutes before the event</li>
          <li>Present your confirmation email at the door</li>
        </ul>
      </div>
      <Link
        href="/"
        className="inline-block rounded-lg bg-amber-500 px-4 py-2 font-semibold text-zinc-950 transition-colors hover:bg-amber-400"
      >
        Browse more events
      </Link>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center">
          <p className="text-zinc-400">Loading...</p>
        </div>
      }
    >
      <BookingSuccessContent />
    </Suspense>
  );
}
