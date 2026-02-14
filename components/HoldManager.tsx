"use client";

import { useState, useCallback } from "react";
import { FloorPlanView } from "./FloorPlanView";
import type { Seat } from "./SectionView";

// Section/Table with seats - Seat can be partial from API
type Section = {
  id: string;
  name: string;
  rows: number;
  cols: number;
  posX: number;
  posY: number;
  color?: string | null;
  seats?: Array<Seat | Partial<Seat>>;
};

type Table = {
  id: string;
  name: string;
  seatCount: number;
  posX: number;
  posY: number;
  color?: string | null;
  seats?: Array<Seat | Partial<Seat>>;
};

type VenueMap = {
  id: string;
  name: string;
  eventId?: string;
  gridCols?: number;
  gridRows?: number;
  stageX?: number;
  stageY?: number;
  stageWidth?: number;
  stageHeight?: number;
  sections: Section[];
  tables: Table[];
};

type Hold = {
  id: string;
  label: string;
  seats: { id: string; seatNumber: string }[];
};

type HoldManagerProps = {
  eventId: string;
  venueMap: VenueMap;
  holds: Hold[];
  onHoldCreated: () => void;
  onHoldReleased: () => void;
};

function usePositionedLayout(venueMap: VenueMap): boolean {
  const hasStage =
    (venueMap.stageWidth ?? 0) > 0 && (venueMap.stageHeight ?? 0) > 0;
  const hasSectionPositions = venueMap.sections.some(
    (s) => (s.posX ?? 0) > 0 || (s.posY ?? 0) > 0
  );
  const hasTablePositions = venueMap.tables.some(
    (t) => (t.posX ?? 0) > 0 || (t.posY ?? 0) > 0
  );
  return hasStage || hasSectionPositions || hasTablePositions;
}

export function HoldManager({
  eventId,
  venueMap,
  holds,
  onHoldCreated,
  onHoldReleased,
}: HoldManagerProps) {
  const [creating, setCreating] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [holdLabel, setHoldLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [releasingId, setReleasingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedSeatIds = new Set(selectedSeats.map((s) => s.id));
  const useLayout = usePositionedLayout(venueMap);

  const handleSeatSelect = useCallback((seat: Seat) => {
    setSelectedSeats((prev) => {
      const isSelected = prev.some((s) => s.id === seat.id);
      if (isSelected) {
        return prev.filter((s) => s.id !== seat.id);
      }
      return [...prev, seat];
    });
  }, []);

  const normalizedVenueMap = {
    ...venueMap,
    gridCols: venueMap.gridCols ?? 24,
    gridRows: venueMap.gridRows ?? 24,
    stageX: venueMap.stageX ?? 0,
    stageY: venueMap.stageY ?? 0,
    stageWidth: venueMap.stageWidth ?? 0,
    stageHeight: venueMap.stageHeight ?? 0,
    sections: (venueMap.sections ?? []).map((s) => ({
      ...s,
      posX: s.posX ?? 0,
      posY: s.posY ?? 0,
      seats: s.seats ?? [],
    })),
    tables: (venueMap.tables ?? []).map((t) => ({
      ...t,
      posX: t.posX ?? 0,
      posY: t.posY ?? 0,
      seats: t.seats ?? [],
    })),
  };

  async function handleCreateHold() {
    if (!holdLabel.trim() || selectedSeats.length === 0) {
      setError("Select at least one seat and enter who the hold is for.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/holds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          seatIds: selectedSeats.map((s) => s.id),
          label: holdLabel.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create hold");
      setCreating(false);
      setSelectedSeats([]);
      setHoldLabel("");
      onHoldCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create hold");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReleaseHold(holdId: string) {
    setReleasingId(holdId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/holds/${holdId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to release hold");
      }
      onHoldReleased();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to release hold");
    } finally {
      setReleasingId(null);
    }
  }

  function holdEntireTable(tableId: string) {
    const table = venueMap.tables.find((t) => t.id === tableId);
    if (!table?.seats) return;
    const availableSeats = table.seats.filter((s) => s.status === "AVAILABLE" && s.id) as Seat[];
    setSelectedSeats((prev) => {
      const existingIds = new Set(prev.map((s) => s.id));
      const toAdd = availableSeats.filter((s) => !existingIds.has(s.id));
      const allSelected = availableSeats.every((s) => existingIds.has(s.id));
      if (allSelected) {
        return prev.filter((s) => !table.seats!.some((t) => t.id === s.id));
      }
      return [...prev, ...toAdd];
    });
  }

  function holdEntireSection(sectionId: string) {
    const section = venueMap.sections.find((s) => s.id === sectionId);
    if (!section?.seats) return;
    const availableSeats = section.seats.filter((s) => s.status === "AVAILABLE" && s.id) as Seat[];
    setSelectedSeats((prev) => {
      const existingIds = new Set(prev.map((s) => s.id));
      const toAdd = availableSeats.filter((s) => !existingIds.has(s.id));
      const allSelected = availableSeats.every((s) => existingIds.has(s.id));
      if (allSelected) {
        return prev.filter((s) => !section.seats!.some((sec) => sec.id === s.id));
      }
      return [...prev, ...toAdd];
    });
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-zinc-400">Holds</h4>
      <p className="text-xs text-zinc-500">
        Hold seats or tables for VIPs, press, or others. Held seats cannot be
        purchased until released.
      </p>

      {holds.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs text-zinc-500">Current holds:</span>
          <ul className="space-y-2">
            {holds.map((hold) => (
              <li
                key={hold.id}
                className="flex items-center justify-between rounded border border-zinc-700 bg-zinc-800/50 px-3 py-2"
              >
                <span className="text-sm text-zinc-200">
                  <strong>{hold.label}</strong> — {hold.seats.length} seat
                  {hold.seats.length !== 1 ? "s" : ""}
                </span>
                <button
                  type="button"
                  onClick={() => handleReleaseHold(hold.id)}
                  disabled={releasingId === hold.id}
                  className="text-sm text-amber-500 hover:text-amber-400 disabled:opacity-50"
                >
                  {releasingId === hold.id ? "Releasing..." : "Release"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!creating ? (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="text-sm text-amber-500 hover:text-amber-400"
        >
          + Create hold
        </button>
      ) : (
        <div className="space-y-4 rounded-lg border border-zinc-700 bg-zinc-800/30 p-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-400">
              Who is this hold for?
            </label>
            <input
              type="text"
              value={holdLabel}
              onChange={(e) => setHoldLabel(e.target.value)}
              placeholder="e.g. VIP, Smith family, Press"
              className="w-full rounded border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500"
            />
          </div>

          <div>
            <span className="mb-2 block text-sm text-zinc-400">
              Quick select:
            </span>
            <div className="flex flex-wrap gap-2">
              {venueMap.tables.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => holdEntireTable(t.id)}
                  className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-700"
                >
                  Hold {t.name}
                </button>
              ))}
              {venueMap.sections.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => holdEntireSection(s.id)}
                  className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-700"
                >
                  Hold {s.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-2 block text-sm text-zinc-400">
              Or click seats on the map ({selectedSeats.length} selected):
            </span>
            <FloorPlanView
              venueMap={normalizedVenueMap as Parameters<typeof FloorPlanView>[0]["venueMap"]}
              selectedSeatIds={selectedSeatIds}
              onSeatSelect={handleSeatSelect}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-800/50 bg-red-900/20 p-3 text-sm text-red-400">{error}</div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCreateHold}
              disabled={
                submitting ||
                selectedSeats.length === 0 ||
                !holdLabel.trim()
              }
              className="rounded bg-amber-500 px-3 py-1.5 text-sm font-medium text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create hold"}
            </button>
            <button
              type="button"
              onClick={() => {
                setCreating(false);
                setSelectedSeats([]);
                setHoldLabel("");
                setError(null);
              }}
              className="rounded border border-zinc-600 px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
