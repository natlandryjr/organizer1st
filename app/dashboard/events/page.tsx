"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Event = {
  id: string;
  name: string;
  date: string;
  description: string;
  location: string | null;
  status: string;
  flyerUrl: string | null;
};

export default function DashboardEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  function loadEvents() {
    fetch("/api/dashboard/events")
      .then((r) => (r.ok ? r.json() : []))
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this event? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/dashboard/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        loadEvents();
      } else {
        const data = await res.json();
        alert(data.error ?? "Failed to delete");
      }
    } catch {
      alert("Failed to delete event");
    } finally {
      setDeleting(null);
    }
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
          Events
        </h1>
        <Link
          href="/dashboard/events/new"
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-accent-500 px-4 py-3 font-medium text-zinc-950 transition-colors hover:bg-accent-400 touch-manipulation sm:py-2.5"
        >
          Create New Event
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/30">
        {events.length === 0 ? (
          <div className="px-8 py-16 text-center">
            <p className="text-zinc-400">No events yet</p>
            <Link
              href="/dashboard/events/new"
              className="mt-4 inline-block text-accent-400 hover:text-accent-300"
            >
              Create your first event
            </Link>
          </div>
        ) : (
          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-zinc-800/60 bg-zinc-800/30">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400 sm:px-6 sm:py-4">
                    Event Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400 sm:px-6 sm:py-4">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400 sm:px-6 sm:py-4">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400 sm:px-6 sm:py-4">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400 sm:px-6 sm:py-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-zinc-800/40 transition-colors hover:bg-zinc-800/20"
                  >
                    <td className="px-4 py-3 sm:px-6 sm:py-4">
                      <Link
                        href={`/events/${event.id}`}
                        className="font-medium text-zinc-50 hover:text-accent-400"
                      >
                        {event.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400 sm:px-6 sm:py-4">
                      {formatDate(event.date)}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400 sm:px-6 sm:py-4">
                      {event.location || "—"}
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          event.status === "PUBLISHED"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-zinc-600/30 text-zinc-400"
                        }`}
                      >
                        {event.status === "PUBLISHED" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right sm:px-6 sm:py-4">
                      <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
                        <Link
                          href={`/dashboard/events/${event.id}/attendees`}
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-50 touch-manipulation sm:min-h-0 sm:min-w-0 sm:py-1.5"
                        >
                          Attendees
                        </Link>
                        <Link
                          href={`/dashboard/events/${event.id}/edit`}
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-50 touch-manipulation sm:min-h-0 sm:min-w-0 sm:py-1.5"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(event.id)}
                          disabled={deleting === event.id}
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50 touch-manipulation sm:min-h-0 sm:min-w-0 sm:py-1.5"
                        >
                          {deleting === event.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
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
