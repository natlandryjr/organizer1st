"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { downloadCsv } from "@/lib/csv";

type Attendee = {
  id: string;
  name: string;
  email: string;
  ticketType: string;
  orderNumber: string;
  createdAt: string;
};

export default function AttendeesPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [eventName, setEventName] = useState("");
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/dashboard/events/${eventId}/attendees`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Failed to load");
        }
        const data = await res.json();
        setAttendees(data.attendees ?? []);
        setEventName(data.event?.name ?? "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load attendees");
        setAttendees([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [eventId]);

  function exportToCsv() {
    const data = attendees.map((a) => ({
      Name: a.name,
      Email: a.email,
      "Ticket Type": a.ticketType,
      "Order Number": a.orderNumber,
    }));
    const filename = `attendees-${eventName.replace(/[^a-z0-9]/gi, "-")}-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCsv(data, filename, ["Name", "Email", "Ticket Type", "Order Number"]);
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-zinc-800" />
        <div className="h-64 rounded-xl border border-zinc-800 bg-zinc-900/30" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard/events"
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            ← Events
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-50">
            Attendees
            {eventName && (
              <span className="ml-2 text-lg font-normal text-zinc-400">
                — {eventName}
              </span>
            )}
          </h1>
        </div>
        <button
          type="button"
          onClick={exportToCsv}
          disabled={attendees.length === 0}
          className="inline-flex items-center justify-center rounded-xl border border-zinc-600 px-4 py-2.5 font-medium text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-50"
        >
          Export to CSV
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/30">
        {attendees.length === 0 ? (
          <div className="px-8 py-16 text-center">
            <p className="text-zinc-400">No attendees yet</p>
            <Link
              href={`/events/${eventId}`}
              className="mt-4 inline-block text-amber-500 hover:text-amber-400"
            >
              View event page
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-zinc-800/60 bg-zinc-800/30">
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Ticket Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Order Number
                  </th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-zinc-800/40 transition-colors hover:bg-zinc-800/20"
                  >
                    <td className="px-6 py-4 font-medium text-zinc-50">
                      {a.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {a.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {a.ticketType}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-zinc-400">
                      #{a.orderNumber}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
