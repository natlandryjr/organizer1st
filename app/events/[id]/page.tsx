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
          <div className="h-8 w-2/3 rounded bg-zinc-800" />
          <div className="mt-3 h-4 w-1/3 rounded bg-zinc-800" />
          <div className="mt-4 space-y-2">
            <div className="h-4 w-full rounded bg-zinc-800" />
            <div className="h-4 w-5/6 rounded bg-zinc-800" />
          </div>
        </div>
        <div className="h-64 w-full rounded-lg bg-zinc-800" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="py-12 text-center text-zinc-400">Event not found.</div>
    );
  }

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const bookedCount = event.venueMap ? getBookedCount(event.venueMap) : 0;
  const maxSeats = event.maxSeats ?? null;
  const atCapacity = maxSeats != null && bookedCount >= maxSeats;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
                {event.name}
              </h1>
            </div>
            <p className="mt-2 text-zinc-400">{formattedDate}</p>
            <p className="mt-4 text-zinc-300">{event.description}</p>
            {maxSeats != null && (
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className={atCapacity ? "font-medium text-amber-400" : "text-zinc-500"}>
                    {bookedCount} of {maxSeats} seats sold
                    {atCapacity ? " — Sold out" : ""}
                  </span>
                  <span className="text-zinc-600 text-xs">
                    {Math.round((bookedCount / maxSeats) * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      bookedCount / maxSeats >= 0.9
                        ? "bg-amber-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(100, (bookedCount / maxSeats) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          {event.flyerUrl && (
            <div className="shrink-0">
              <img
                src={event.flyerUrl}
                alt={`${event.name} flyer`}
                className="max-h-80 w-auto rounded-lg border border-zinc-700 object-cover shadow-lg"
              />
            </div>
          )}
        </div>
      </div>

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
