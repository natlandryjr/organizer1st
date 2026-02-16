"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

type Seat = {
  id: string;
  seatNumber: string;
  section: { name: string } | null;
  table: { name: string } | null;
};

type Booking = {
  id: string;
  attendeeName: string;
  attendeeEmail: string;
  seats: Seat[];
};

type Event = {
  id: string;
  name: string;
  date: string | null;
  location: string | null;
} | null;

type Data = {
  booking: Booking;
  event: Event;
  qrDataUrl: string;
};

function getSeatLabel(seat: Seat): string {
  if (seat.section) return `${seat.section.name}, Seat ${seat.seatNumber}`;
  if (seat.table) return `${seat.table.name}, Seat ${seat.seatNumber}`;
  return `Seat ${seat.seatNumber}`;
}

export default function ManageTicketsPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid link");
      setLoading(false);
      return;
    }

    async function fetchTickets() {
      try {
        const res = await fetch(`/api/tickets/${token}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Link expired or invalid");
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, [token]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-2 border-zinc-700 border-t-accent-500" />
        <p className="text-zinc-400">Loading your tickets...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-12 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <svg className="h-6 w-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-zinc-50">Link not found</h1>
        </div>
        <p className="rounded-xl border border-red-800/30 bg-red-900/10 p-4 text-red-400">{error}</p>
        <Link href="/" className="inline-flex items-center gap-1.5 text-accent-500 hover:text-accent-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Return to events
        </Link>
      </div>
    );
  }

  const { booking, event, qrDataUrl } = data;
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

  return (
    <div className="mx-auto max-w-lg space-y-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-zinc-50">Your tickets</h1>
        <p className="mt-1 text-zinc-400">
          Hi, {booking.attendeeName}. Manage your tickets below.
        </p>
      </div>

      {/* Event & ticket card — printable */}
      <div className="overflow-hidden glass-card print:shadow-none print:border print:border-zinc-700">
        <div className="border-b border-zinc-800/60 px-5 py-3">
          <p className="text-xs text-zinc-500">
            Booking ref: <span className="font-mono text-zinc-300">#{booking.id.slice(-8).toUpperCase()}</span>
          </p>
        </div>
        {event && (
          <div className="border-b border-zinc-800/60 px-5 py-4">
            <p className="font-semibold text-zinc-100">{event.name}</p>
            {eventDate && <p className="mt-1 text-sm text-zinc-400">{eventDate}</p>}
            {event.location && <p className="mt-0.5 text-sm text-zinc-500">{event.location}</p>}
          </div>
        )}
        <div className="p-5 space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Your seats</h2>
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
        <div className="border-t border-zinc-800/60 p-5 text-center">
          <p className="mb-3 text-sm font-medium text-zinc-400">Present this QR code at check-in</p>
          <img
            src={qrDataUrl}
            alt="Ticket QR Code"
            width={220}
            height={220}
            className="mx-auto rounded-lg border border-zinc-700"
          />
        </div>
      </div>

      {/* Actions — hidden when printing */}
      <div className="flex flex-col gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="btn-glow w-full rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 py-3 font-semibold text-white shadow-lg shadow-primary-500/20"
        >
          Download / Print ticket
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 py-3 font-medium text-zinc-300 hover:bg-zinc-800"
        >
          Browse more events
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
      </div>

      <p className="text-center text-xs text-zinc-500 print:hidden">
        Save this page or bookmark the link to access your tickets anytime.
      </p>
    </div>
  );
}
