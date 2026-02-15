"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Venue = {
  id: string;
  name: string;
  layout: unknown;
  createdAt: string;
  updatedAt: string;
};

export function VenuesList() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVenues() {
      try {
        const res = await fetch("/api/dashboard/venues");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setVenues(data);
      } catch {
        setVenues([]);
      } finally {
        setLoading(false);
      }
    }
    fetchVenues();
  }, []);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete venue "${name}"?`)) return;
    try {
      const res = await fetch(`/api/dashboard/venues/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setVenues((v) => v.filter((x) => x.id !== id));
    } catch {
      alert("Failed to delete venue");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-800/40" />
        ))}
      </div>
    );
  }

  if (venues.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-700/60 bg-zinc-900/30 p-12 text-center">
        <p className="text-zinc-500">No venues yet.</p>
        <Link
          href="/dashboard/venues/new"
          className="mt-4 inline-block text-amber-500 hover:text-amber-400"
        >
          Create your first venue
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {venues.map((venue) => (
        <div
          key={venue.id}
          className="flex flex-col rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4"
        >
          <h3 className="font-semibold text-zinc-100">{venue.name}</h3>
          <p className="mt-1 text-xs text-zinc-500">
            Updated {new Date(venue.updatedAt).toLocaleDateString()}
          </p>
          <div className="mt-4 flex gap-2">
            <Link
              href={`/dashboard/venues/${venue.id}/edit`}
              className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={() => handleDelete(venue.id, venue.name)}
              className="rounded-lg border border-red-800/50 px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-500/10"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
