"use client";

import { useState, useEffect, useMemo, type ComponentProps } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { LayoutDesigner } from "@/components/LayoutDesigner";
import { HoldManager } from "@/components/HoldManager";
import { AttendeesManager } from "@/components/AttendeesManager";

type Seat = {
  id: string;
  seatNumber: string;
  status: string;
  sectionId?: string | null;
  tableId?: string | null;
  bookingId?: string | null;
  holdId?: string | null;
  hold?: { id: string; label: string } | null;
};

type Section = {
  id: string;
  name: string;
  rows: number;
  cols: number;
  posX: number;
  posY: number;
  color: string | null;
  seats?: Seat[];
};

type Table = {
  id: string;
  name: string;
  seatCount: number;
  posX: number;
  posY: number;
  color: string | null;
  seats?: Seat[];
};

const COLOR_PALETTE = [
  "#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#ec4899", "#84cc16", "#64748b", "#f97316",
];

type VenueMap = {
  id: string;
  name: string;
  gridCols: number;
  gridRows: number;
  stageX: number;
  stageY: number;
  stageWidth: number;
  stageHeight: number;
  sections: Section[];
  tables: Table[];
};

type Event = {
  id: string;
  name: string;
  maxSeats: number | null;
  flyerUrl: string | null;
  venueMap: VenueMap | null;
};

type TabId = "settings" | "layout" | "holds" | "attendees";

const TABS: { id: TabId; label: string }[] = [
  { id: "settings", label: "Settings" },
  { id: "layout", label: "Layout" },
  { id: "holds", label: "Holds" },
  { id: "attendees", label: "Attendees" },
];

export default function EditLayoutPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("settings");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/events/${eventId}`);
        if (!res.ok) throw new Error("Event not found");
        const data = await res.json();
        setEvent(data);
      } catch {
        setEvent(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [eventId]);

  const holds = useMemo(() => {
    const vm = event?.venueMap;
    if (!vm) return [];
    const byHold = new Map<string, { id: string; label: string; seats: { id: string; seatNumber: string }[] }>();
    for (const s of vm.sections ?? []) {
      for (const seat of s.seats ?? []) {
        if (seat.holdId && seat.hold) {
          const existing = byHold.get(seat.holdId);
          if (existing) {
            existing.seats.push({ id: seat.id, seatNumber: seat.seatNumber });
          } else {
            byHold.set(seat.holdId, {
              id: seat.hold.id,
              label: seat.hold.label,
              seats: [{ id: seat.id, seatNumber: seat.seatNumber }],
            });
          }
        }
      }
    }
    for (const t of vm.tables ?? []) {
      for (const seat of t.seats ?? []) {
        if (seat.holdId && seat.hold) {
          const existing = byHold.get(seat.holdId);
          if (existing) {
            existing.seats.push({ id: seat.id, seatNumber: seat.seatNumber });
          } else {
            byHold.set(seat.holdId, {
              id: seat.hold.id,
              label: seat.hold.label,
              seats: [{ id: seat.id, seatNumber: seat.seatNumber }],
            });
          }
        }
      }
    }
    return Array.from(byHold.values());
  }, [event?.venueMap]);

  async function handleSave() {
    if (!event?.venueMap) return;
    setSaving(true);
    setMessage(null);
    try {
      const [layoutRes, eventRes] = await Promise.all([
        fetch(`/api/venue-maps/${event.venueMap.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gridCols: event.venueMap.gridCols,
            gridRows: event.venueMap.gridRows,
            stage: {
              x: 0,
              y: 0,
              width: event.venueMap.stageWidth || 20,
              height: event.venueMap.stageHeight || 20,
            },
            sections: event.venueMap.sections.map((s) => ({
              id: s.id,
              posX: s.posX,
              posY: s.posY,
              color: s.color ?? null,
            })),
            tables: event.venueMap.tables.map((t) => ({
              id: t.id,
              posX: t.posX,
              posY: t.posY,
              color: t.color ?? null,
            })),
          }),
        }),
        fetch(`/api/events/${event.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            maxSeats: event.maxSeats ?? null,
            flyerUrl: event.flyerUrl ?? null,
          }),
        }),
      ]);
      if (!layoutRes.ok) throw new Error("Failed to save layout");
      if (!eventRes.ok) throw new Error("Failed to save event settings");
      setMessage({ type: "success", text: "Layout and settings saved!" });
    } catch {
      setMessage({ type: "error", text: "Failed to save layout" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-zinc-400">Loading...</div>
    );
  }

  if (!event?.venueMap) {
    return (
      <div className="space-y-4">
        <p className="text-red-400">Event not found or has no venue map.</p>
        <Link href="/" className="text-amber-500 hover:text-amber-400">
          &larr; Back to home
        </Link>
      </div>
    );
  }

  const vm = event.venueMap;
  const gridCols = vm.gridCols ?? 24;
  const gridRows = vm.gridRows ?? 24;

  const refreshEvent = () => {
    fetch(`/api/events/${eventId}`)
      .then((r) => r.ok && r.json())
      .then((data) => data && setEvent(data))
      .catch(() => {});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-zinc-50">
          Edit layout: {event.name}
        </h2>
        <div className="flex gap-4">
          <Link
            href={`/events/${eventId}`}
            className="text-sm text-zinc-400 hover:text-zinc-300"
          >
            View event
          </Link>
          <Link href="/admin5550" className="text-sm text-zinc-400 hover:text-zinc-300">
            Create new
          </Link>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-zinc-700 text-zinc-50"
                : "text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
        {/* Settings tab */}
        {activeTab === "settings" && (
          <>
            <h3 className="text-lg font-medium text-zinc-300">Event settings</h3>
            <div>
              <label className="mb-1 block text-sm text-zinc-400">
                Max seating (optional)
              </label>
              <input
                type="number"
                min={1}
                value={event.maxSeats ?? ""}
                onChange={(e) =>
                  setEvent({
                    ...event,
                    maxSeats: e.target.value ? parseInt(e.target.value, 10) : null,
                  })
                }
                className="w-32 rounded border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-100"
                placeholder="No limit"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Maximum tickets to sell. Prevents overselling.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-400">
                Event flyer image URL (optional)
              </label>
              <input
                type="url"
                value={event.flyerUrl ?? ""}
                onChange={(e) =>
                  setEvent({
                    ...event,
                    flyerUrl: e.target.value.trim() || null,
                  })
                }
                className="w-full rounded border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-100"
                placeholder="https://example.com/flyer.jpg"
              />
            </div>
          </>
        )}

        {/* Layout tab */}
        {activeTab === "layout" && (
          <>
            <h3 className="text-lg font-medium text-zinc-300">Stage</h3>
            <p className="text-xs text-zinc-500">
              Stage is fixed at the top. Adjust size only.
            </p>
            <div className="flex gap-4">
              <div>
                <label className="mb-0.5 block text-xs text-zinc-500">Width</label>
                <input
                  type="number"
                  min={1}
                  value={vm.stageWidth}
                  onChange={(e) =>
                    setEvent({
                      ...event!,
                      venueMap: {
                        ...vm,
                        stageWidth: parseInt(e.target.value) || 20,
                      },
                    })
                  }
                  className="w-14 rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-sm text-zinc-100"
                />
              </div>
              <div>
                <label className="mb-0.5 block text-xs text-zinc-500">Height</label>
                <input
                  type="number"
                  min={1}
                  value={vm.stageHeight}
                  onChange={(e) =>
                    setEvent({
                      ...event!,
                      venueMap: {
                        ...vm,
                        stageHeight: parseInt(e.target.value) || 20,
                      },
                    })
                  }
                  className="w-14 rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-sm text-zinc-100"
                />
              </div>
            </div>

            <details className="rounded-lg border border-zinc-700 bg-zinc-800/30">
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-zinc-400 hover:text-zinc-300">
                Section &amp; table colors
              </summary>
              <div className="flex flex-wrap gap-4 px-4 pb-4 pt-2">
                {vm.sections.map((sec, i) => (
                  <div key={sec.id} className="flex items-center gap-2">
                    <span className="text-sm text-zinc-400">{sec.name || `Section ${i + 1}`}</span>
                    <div className="flex gap-1">
                      {COLOR_PALETTE.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            const sections = [...vm.sections];
                            sections[i] = { ...sections[i], color: c };
                            setEvent({ ...event!, venueMap: { ...vm, sections } });
                          }}
                          className={`h-5 w-5 rounded border-2 transition-all ${
                            (sec.color ?? "") === c ? "border-zinc-100 scale-110" : "border-transparent hover:border-zinc-500"
                          }`}
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                {vm.tables.map((tab, i) => (
                  <div key={tab.id} className="flex items-center gap-2">
                    <span className="text-sm text-zinc-400">{tab.name || `Table ${i + 1}`}</span>
                    <div className="flex gap-1">
                      {COLOR_PALETTE.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            const tables = [...vm.tables];
                            tables[i] = { ...tables[i], color: c };
                            setEvent({ ...event!, venueMap: { ...vm, tables } });
                          }}
                          className={`h-5 w-5 rounded border-2 transition-all ${
                            (tab.color ?? "") === c ? "border-zinc-100 scale-110" : "border-transparent hover:border-zinc-500"
                          }`}
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </details>

            <div>
              <h4 className="mb-2 text-sm font-medium text-zinc-400">Layout designer</h4>
              <p className="mb-2 text-xs text-zinc-500">
                Drag items to reposition them on the grid.
              </p>
              <LayoutDesigner
                gridCols={gridCols}
                gridRows={gridRows}
                stage={{
                  x: vm.stageX,
                  y: vm.stageY,
                  width: vm.stageWidth,
                  height: vm.stageHeight,
                }}
                sections={vm.sections.map((s) => ({
                  name: s.name,
                  rows: s.rows,
                  cols: s.cols,
                  posX: s.posX,
                  posY: s.posY,
                  color: s.color ?? undefined,
                }))}
                tables={vm.tables.map((t) => ({
                  name: t.name,
                  seatCount: t.seatCount,
                  posX: t.posX,
                  posY: t.posY,
                  color: t.color ?? undefined,
                }))}
                onStageChange={(s) =>
                  setEvent({
                    ...event!,
                    venueMap: {
                      ...vm,
                      stageX: s.x,
                      stageY: s.y,
                      stageWidth: s.width,
                      stageHeight: s.height,
                    },
                  })
                }
                onSectionChange={(i, posX, posY) => {
                  const sections = [...vm.sections];
                  sections[i] = { ...sections[i], posX, posY };
                  setEvent({ ...event!, venueMap: { ...vm, sections } });
                }}
                onTableChange={(i, posX, posY) => {
                  const tables = [...vm.tables];
                  tables[i] = { ...tables[i], posX, posY };
                  setEvent({ ...event!, venueMap: { ...vm, tables } });
                }}
              />
            </div>
          </>
        )}

        {/* Holds tab */}
        {activeTab === "holds" && (
          <HoldManager
            eventId={event.id}
            venueMap={vm as ComponentProps<typeof HoldManager>["venueMap"]}
            holds={holds}
            onHoldCreated={refreshEvent}
            onHoldReleased={refreshEvent}
          />
        )}

        {/* Attendees tab */}
        {activeTab === "attendees" && (
          <AttendeesManager
            eventId={event.id}
            venueMap={vm as ComponentProps<typeof AttendeesManager>["venueMap"]}
            onAttendeesChange={refreshEvent}
          />
        )}

        {message && (
          <div
            className={`rounded-lg p-4 ${
              message.type === "success"
                ? "bg-green-900/30 text-green-300 border border-green-800"
                : "bg-red-900/30 text-red-300 border border-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-amber-500 px-6 py-2.5 font-semibold text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save layout"}
        </button>
      </div>
    </div>
  );
}
