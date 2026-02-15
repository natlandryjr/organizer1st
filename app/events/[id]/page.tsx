"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SeatingChart } from "@/components/SeatingChart";

type Seat = {
  id: string;
  seatNumber: string;
  status: string;
  sectionId: string | null;
  tableId: string | null;
  bookingId: string | null;
};

type Section = {
  id: string;
  name: string;
  rows: number;
  cols: number;
  venueMapId: string;
  seats: Seat[];
};

type Table = {
  id: string;
  name: string;
  seatCount: number;
  venueMapId: string;
  seats: Seat[];
};

type VenueMap = {
  id: string;
  name: string;
  eventId: string;
  sections: Section[];
  tables: Table[];
};

type Event = {
  id: string;
  name: string;
  date: string;
  endDate?: string | null;
  description: string;
  maxSeats: number | null;
  flyerUrl: string | null;
  venueMap: VenueMap | null;
};

function getBookedCount(venueMap: VenueMap): number {
  let count = 0;
  for (const s of venueMap.sections) {
    count += s.seats.filter((seat) => seat.status === "BOOKED").length;
  }
  for (const t of venueMap.tables) {
    count += t.seats.filter((seat) => seat.status === "BOOKED").length;
  }
  return count;
}

export default function EventPage() {
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      try {
        const res = await fetch(`/api/events/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setEvent(null);
            setLoading(false);
            return;
          }
          throw new Error("Failed to fetch event");
        }
        const data = await res.json();
        setEvent(data);
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div>
          <div className="h-10 w-2/3 rounded-lg bg-zinc-800/60" />
          <div className="mt-4 h-5 w-1/3 rounded bg-zinc-800/40" />
          <div className="mt-6 space-y-2">
            <div className="h-4 w-full rounded bg-zinc-800/30" />
            <div className="h-4 w-5/6 rounded bg-zinc-800/30" />
          </div>
        </div>
        <div className="h-72 w-full rounded-2xl bg-zinc-800/20" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800/50">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
        </div>
        <p className="text-lg text-zinc-400">Event not found</p>
        <Link href="/" className="mt-4 text-sm text-accent-500 hover:text-accent-400">
          Back to events
        </Link>
      </div>
    );
  }

  const formatDateTime = (d: Date) =>
    d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  const formattedDate = event.endDate
    ? `${formatDateTime(new Date(event.date))} – ${new Date(event.endDate).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
    : formatDateTime(new Date(event.date));

  const bookedCount = event.venueMap ? getBookedCount(event.venueMap) : 0;
  const maxSeats = event.maxSeats ?? null;
  const atCapacity = maxSeats != null && bookedCount >= maxSeats;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        All events
      </Link>

      {/* Event header */}
      <div className="hero-gradient -mx-4 px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
              {event.name}
            </h1>
            <div className="mt-3 flex items-center gap-2 text-zinc-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-accent-500/70">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                <line x1="16" x2="16" y1="2" y2="6"/>
                <line x1="8" x2="8" y1="2" y2="6"/>
                <line x1="3" x2="21" y1="10" y2="10"/>
              </svg>
              {formattedDate}
            </div>
            <p className="mt-4 max-w-2xl leading-relaxed text-zinc-300/90">{event.description}</p>

            {maxSeats != null && (
              <div className="mt-5 max-w-sm">
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className={atCapacity ? "font-medium text-accent-400" : "text-zinc-500"}>
                    {bookedCount} of {maxSeats} seats sold
                    {atCapacity ? " — Sold out" : ""}
                  </span>
                  <span className="font-mono text-xs text-zinc-600">
                    {Math.round((bookedCount / maxSeats) * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800/60">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      bookedCount / maxSeats >= 0.9
                        ? "bg-gradient-to-r from-primary-600 via-accent2-500 to-accent2-400"
                        : "bg-gradient-to-r from-emerald-600 to-emerald-400"
                    }`}
                    style={{ width: `${Math.min(100, (bookedCount / maxSeats) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {event.flyerUrl && (
            <div className="relative w-full shrink-0 animate-fade-in overflow-hidden rounded-2xl gradient-border shadow-2xl shadow-black/40 sm:w-auto">
              <img
                src={event.flyerUrl}
                alt={`${event.name} flyer`}
                className="max-h-64 w-full object-cover sm:max-h-80 sm:w-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-zinc-950/10" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h2 className="text-lg font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {event.name}
                </h2>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="section-divider" />

      {event.venueMap && (
        <SeatingChart
          venueMap={event.venueMap}
          maxSeats={maxSeats}
          bookedCount={bookedCount}
        />
      )}
    </div>
  );
}
