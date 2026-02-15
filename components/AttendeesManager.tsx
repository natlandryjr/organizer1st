"use client";

import { useState, useEffect, useCallback } from "react";
import { FloorPlanView } from "./FloorPlanView";
import type { Seat } from "./SectionView";

type Section = {
  id: string;
  name: string;
  rows: number;
  cols: number;
  posX: number;
  posY: number;
  color?: string | null;
  seats?: Seat[];
};

type Table = {
  id: string;
  name: string;
  seatCount: number;
  posX: number;
  posY: number;
  color?: string | null;
  seats?: Seat[];
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

type Attendee = {
  id: string;
  attendeeName: string;
  attendeeEmail: string;
  createdAt: string;
  seatCount: number;
  seats: { id: string; seatNumber: string; sectionName?: string; tableName?: string }[];
};

type AttendeesManagerProps = {
  eventId: string;
  venueMap: VenueMap;
  onAttendeesChange: () => void;
};

function usePositionedLayout(venueMap: VenueMap): boolean {
  const hasStage =
    (venueMap.stageWidth ?? 0) > 0 && (venueMap.stageHeight ?? 0) > 0;
  const hasSectionPositions = (venueMap.sections ?? []).some(
    (s) => (s.posX ?? 0) > 0 || (s.posY ?? 0) > 0
  );
  const hasTablePositions = (venueMap.tables ?? []).some(
    (t) => (t.posX ?? 0) > 0 || (t.posY ?? 0) > 0
  );
  return hasStage || hasSectionPositions || hasTablePositions;
}

export function AttendeesManager({
  eventId,
  venueMap,
  onAttendeesChange,
}: AttendeesManagerProps) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedSeatIds = new Set(selectedSeats.map((s) => s.id));
  const useLayout = usePositionedLayout(venueMap);

  const fetchAttendees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/attendees?eventId=${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setAttendees(data);
      }
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchAttendees();
  }, [fetchAttendees]);

  const handleSeatSelect = useCallback((seat: Seat) => {
    setSelectedSeats((prev) => {
      const isSelected = prev.some((s) => s.id === seat.id);
      if (isSelected) {
        return prev.filter((s) => s.id !== seat.id);
      }
      if (seat.status !== "AVAILABLE" && seat.status !== "HELD") return prev;
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
    eventId: venueMap.eventId ?? "",
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

  async function handleAddAttendee() {
    if (!addName.trim() || !addEmail.trim() || selectedSeats.length === 0) {
      setError("Select at least one seat and enter name and email.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          seatIds: selectedSeats.map((s) => s.id),
          attendeeName: addName.trim(),
          attendeeEmail: addEmail.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add attendee");
      setAdding(false);
      setSelectedSeats([]);
      setAddName("");
      setAddEmail("");
      fetchAttendees();
      onAttendeesChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add attendee");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(a: Attendee) {
    setEditingId(a.id);
    setEditName(a.attendeeName);
    setEditEmail(a.attendeeEmail);
    setError(null);
  }

  async function handleSaveEdit() {
    if (!editingId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendeeName: editName.trim(),
          attendeeEmail: editEmail.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setEditingId(null);
      fetchAttendees();
      onAttendeesChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      fetchAttendees();
      onAttendeesChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-zinc-400">Attendees</h4>
      <p className="text-xs text-zinc-500">
        Add, edit, or remove attendees and their seat assignments.
      </p>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading attendees...</p>
      ) : (
        <>
          {attendees.length > 0 && (
            <div className="space-y-2">
              <ul className="space-y-2">
                {attendees.map((a) => (
                  <li
                    key={a.id}
                    className="rounded border border-zinc-700 bg-zinc-800/50 px-3 py-2"
                  >
                    {editingId === a.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Name"
                          className="w-full rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-sm text-zinc-100"
                        />
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          placeholder="Email"
                          className="w-full rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-sm text-zinc-100"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            disabled={submitting}
                            className="text-sm text-accent-500 hover:text-accent-400 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="text-sm text-zinc-400 hover:text-zinc-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-zinc-200">
                            {a.attendeeName}
                          </p>
                          <p className="text-sm text-zinc-500">
                            {a.attendeeEmail}
                          </p>
                          <p className="mt-1 text-xs text-zinc-600">
                            {a.seats
                              .map(
                                (s) =>
                                  s.sectionName
                                    ? `${s.sectionName} ${s.seatNumber}`
                                    : s.tableName
                                      ? `${s.tableName} #${s.seatNumber}`
                                      : s.seatNumber
                              )
                              .join(", ")}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(a)}
                            className="text-sm text-accent-500 hover:text-accent-400"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(a.id)}
                            disabled={deletingId === a.id}
                            className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
                          >
                            {deletingId === a.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!adding ? (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="text-sm text-accent-500 hover:text-accent-400"
            >
              + Add attendee
            </button>
          ) : (
            <div className="space-y-4 rounded-lg border border-zinc-700 bg-zinc-800/30 p-4">
              <div>
                <label className="mb-1 block text-sm text-zinc-400">Name</label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="Attendee name"
                  className="w-full rounded border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-400">Email</label>
                <input
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="attendee@example.com"
                  className="w-full rounded border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-100"
                />
              </div>
              <div>
                <span className="mb-2 block text-sm text-zinc-400">
                  Select seats ({selectedSeats.length} selected):
                </span>
                <FloorPlanView
                  venueMap={normalizedVenueMap as Parameters<typeof FloorPlanView>[0]["venueMap"]}
                  selectedSeatIds={selectedSeatIds}
                  onSeatSelect={handleSeatSelect}
                  allowHeldSelection
                />
              </div>
              {error && <div className="rounded-lg border border-red-800/50 bg-red-900/20 p-3 text-sm text-red-400">{error}</div>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddAttendee}
                  disabled={
                    submitting ||
                    selectedSeats.length === 0 ||
                    !addName.trim() ||
                    !addEmail.trim()
                  }
                  className="rounded bg-button px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-600 disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add attendee"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdding(false);
                    setSelectedSeats([]);
                    setAddName("");
                    setAddEmail("");
                    setError(null);
                  }}
                  className="rounded border border-zinc-600 px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {error && !adding && <div className="rounded-lg border border-red-800/50 bg-red-900/20 p-3 text-sm text-red-400">{error}</div>}
        </>
      )}
    </div>
  );
}
