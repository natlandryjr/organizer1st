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
  emailSent?: boolean;
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
  const eventId = searchParams.get("event_id");

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
          body: JSON.stringify({ session_id: sessionId, event_id: eventId }),
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
  }, [sessionId, eventId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-2 border-zinc-700 border-t-accent-500" />
        <p className="text-zinc-400">Confirming your booking...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-12 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <svg className="h-6 w-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx={12} cy={12} r={10} />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-zinc-50">Booking Error</h1>
        </div>
        <p className="rounded-xl border border-red-800/30 bg-red-900/10 p-4 text-red-400">{error}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-accent-500 hover:text-accent-400"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Return to events
        </Link>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 py-8 animate-fade-in">
      {/* Success header */}
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
          <svg className="h-10 w-10 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx={12} cy={12} r={10} />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-zinc-50">
          You&apos;re all set!
        </h1>
        <p className="mt-2 text-zinc-400">
          Thank you, <span className="font-medium text-zinc-200">{booking.attendeeName}</span>!
          {booking.emailSent ? (
            <>A confirmation with your ticket QR code has been sent to{" "}
              <span className="text-zinc-300">{booking.attendeeEmail}</span>.</>
          ) : (
            <>Your booking reference is{" "}
              <span className="font-mono text-zinc-300">#{booking.id.slice(-8).toUpperCase()}</span>.
              Present this at the door for check-in.</>
          )}
        </p>
      </div>

      {/* Booking details card */}
      <div className="overflow-hidden glass-card">
        <div className="border-b border-zinc-800/60 px-5 py-3">
          <p className="text-xs text-zinc-500">
            Booking reference: <span className="font-mono text-zinc-300">#{booking.id.slice(-8)}</span>
          </p>
        </div>
        <div className="p-5 space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">
            Your seats
          </h2>
          <ul className="space-y-2">
            {booking.seats.map((seat) => (
              <li key={seat.id} className="flex items-center gap-3 text-zinc-300">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-500/10 text-xs font-semibold text-accent-400">
                  {seat.seatNumber}
                </span>
                {getSeatLabel(seat)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* What's next card */}
      <div className="glass-card p-5">
        <h3 className="mb-3 text-sm font-medium text-zinc-300">What&apos;s next?</h3>
        <ul className="space-y-2 text-sm text-zinc-500">
          <li className="flex items-start gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-accent-500/60">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Check your email for your booking confirmation
          </li>
          <li className="flex items-start gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-accent-500/60">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Arrive at least 15 minutes before the event
          </li>
          <li className="flex items-start gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-accent-500/60">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Present your confirmation email at the door
          </li>
        </ul>
      </div>

      <div className="text-center">
        <Link
          href="/"
          className="btn-glow inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-2.5 font-semibold text-white shadow-lg shadow-primary-500/20"
        >
          Browse more events
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center py-20 text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-2 border-zinc-700 border-t-accent-500" />
          <p className="text-zinc-400">Loading...</p>
        </div>
      }
    >
      <BookingSuccessContent />
    </Suspense>
  );
}
