"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { VenueBuilder } from "@/components/VenueBuilder";
import type { VenueLayout } from "@/components/VenueBuilder/types";

const DEFAULT_LAYOUT: VenueLayout = {
  canvasWidth: 800,
  canvasHeight: 600,
  components: [],
};

export default function EditVenuePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [name, setName] = useState("");
  const [layout, setLayout] = useState<VenueLayout>(DEFAULT_LAYOUT);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/dashboard/venues/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setName(data.name);
        setLayout(
          data.layout && typeof data.layout === "object"
            ? {
                canvasWidth: data.layout.canvasWidth ?? 800,
                canvasHeight: data.layout.canvasHeight ?? 600,
                components: Array.isArray(data.layout.components)
                  ? data.layout.components
                  : [],
              }
            : DEFAULT_LAYOUT
        );
      } catch {
        setError("Venue not found");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSave() {
    if (!name.trim()) {
      setError("Enter a venue name");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/dashboard/venues/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), layout }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }
      router.push("/dashboard/venues");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 rounded bg-zinc-800/40" />
        <div className="h-96 rounded-xl bg-zinc-800/20" />
      </div>
    );
  }

  if (error && !name) {
    return (
      <div className="text-center">
        <p className="text-red-400">{error}</p>
        <Link href="/dashboard/venues" className="mt-4 inline-block text-amber-500">
          Back to venues
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/venues"
          className="text-sm text-zinc-500 hover:text-zinc-300"
        >
          ← Back to venues
        </Link>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-0 flex-1">
          <label htmlFor="venue-name" className="mb-1 block text-sm font-medium text-zinc-300">
            Venue Name
          </label>
          <input
            id="venue-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Main Hall"
            className="w-full max-w-xs rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-4 py-2.5 text-zinc-100 placeholder-zinc-500 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-amber-500 px-4 py-2.5 font-medium text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link
            href="/dashboard/venues"
            className="rounded-xl border border-zinc-600 px-4 py-2.5 font-medium text-zinc-300 hover:bg-zinc-800"
          >
            Cancel
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6">
        <VenueBuilder
          layout={layout}
          onLayoutChange={setLayout}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>
    </div>
  );
}
