"use client";

import { useParams } from "next/navigation";
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
  venueMap: VenueMap | null;
};

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
      <div className="py-12 text-center text-zinc-400">Loading...</div>
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
          {event.name}
        </h1>
        <p className="mt-2 text-zinc-400">{formattedDate}</p>
        <p className="mt-4 text-zinc-300">{event.description}</p>
      </div>

      {event.venueMap && <SeatingChart venueMap={event.venueMap} />}
    </div>
  );
}
