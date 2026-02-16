"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type TicketTypeRow = {
  id?: string;
  name: string;
  price: number;
  quantity: number | null;
};

type PromoCodeRow = {
  id?: string;
  code: string;
  discountType: "PERCENT" | "FLAT";
  discountValue: number;
};

type Venue = { id: string; name: string };

type EventFormProps = {
  event?: {
    id: string;
    name: string;
    description: string;
    date: string;
    endDate?: string | null;
    location: string | null;
    status: string;
    flyerUrl: string | null;
    venueId?: string | null;
    ticketTypes?: TicketTypeRow[];
    promoCodes?: PromoCodeRow[];
  };
};

export function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const isEdit = !!event;

  const [name, setName] = useState(event?.name ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [date, setDate] = useState(
    event?.date ? new Date(event.date).toISOString().slice(0, 16) : ""
  );
  const [endDate, setEndDate] = useState(
    event?.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : ""
  );
  const [location, setLocation] = useState(event?.location ?? "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    (event?.status as "DRAFT" | "PUBLISHED") ?? "DRAFT"
  );
  const [flyerUrl, setFlyerUrl] = useState(event?.flyerUrl ?? "");
  const [venueId, setVenueId] = useState<string | "">(event?.venueId ?? "");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeRow[]>(
    event?.ticketTypes?.length
      ? event.ticketTypes.map((t) => ({
          id: t.id,
          name: t.name,
          price: t.price / 100,
          quantity: t.quantity,
        }))
      : [{ name: "", price: 50, quantity: null }]
  );
  const [promoCodes, setPromoCodes] = useState<PromoCodeRow[]>(
    event?.promoCodes?.length
      ? event.promoCodes.map((p) => ({
          ...p,
          discountValue:
            p.discountType === "FLAT" ? p.discountValue / 100 : p.discountValue,
        }))
      : []
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchVenues() {
      try {
        const res = await fetch("/api/dashboard/venues");
        if (res.ok) {
          const data = await res.json();
          setVenues(data);
        }
      } catch {
        // ignore
      }
    }
    fetchVenues();
  }, []);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      setFlyerUrl(`${baseUrl}${data.url}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function addTicketType() {
    setTicketTypes((t) => [...t, { name: "", price: 50, quantity: null }]);
  }

  function removeTicketType(i: number) {
    setTicketTypes((t) => t.filter((_, j) => j !== i));
  }

  function updateTicketType(i: number, field: keyof TicketTypeRow, value: string | number | null) {
    setTicketTypes((t) =>
      t.map((row, j) =>
        j === i ? { ...row, [field]: value } : row
      )
    );
  }

  function addPromoCode() {
    setPromoCodes((p) => [...p, { code: "", discountType: "PERCENT", discountValue: 10 }]);
  }

  function removePromoCode(i: number) {
    setPromoCodes((p) => p.filter((_, j) => j !== i));
  }

  function updatePromoCode(i: number, field: keyof PromoCodeRow, value: string | number) {
    setPromoCodes((p) =>
      p.map((row, j) => (j === i ? { ...row, [field]: value } : row))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const validTicketTypes = ticketTypes.filter((t) => t.name.trim());
    if (validTicketTypes.length === 0) {
      setError("Add at least one ticket type with a name and price.");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        name,
        description,
        date: date ? new Date(date).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        location: location.trim() || null,
        status,
        flyerUrl: flyerUrl.trim() || null,
        venueId: venueId.trim() || null,
        ticketTypes: validTicketTypes.map((t) => ({
          name: t.name.trim(),
          price: Math.round((typeof t.price === "number" ? t.price : parseFloat(String(t.price)) || 0) * 100),
          quantity: t.quantity != null && t.quantity > 0 ? t.quantity : null,
        })),
        promoCodes: promoCodes
          .filter((p) => p.code.trim())
          .map((p) => ({
            code: p.code.trim(),
            discountType: p.discountType,
            discountValue:
              p.discountType === "FLAT"
                ? Math.round(p.discountValue * 100)
                : p.discountValue,
          })),
      };

      if (isEdit) {
        const res = await fetch(`/api/dashboard/events/${event.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Failed to update");
        }
        router.push("/dashboard/events");
      } else {
        const res = await fetch("/api/dashboard/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Failed to create");
        }
        router.push("/dashboard/events");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-zinc-300">
          Event Title
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="min-h-[44px] w-full rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:border-accent-500/60 focus:outline-none focus:ring-1 focus:ring-accent-500/40 sm:py-2.5"
          placeholder="Summer Jazz Night"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-zinc-300">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          className="min-h-[44px] w-full rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:border-accent-500/60 focus:outline-none focus:ring-1 focus:ring-accent-500/40 sm:py-2.5"
          placeholder="Describe your event..."
        />
      </div>

      <div>
        <label htmlFor="date" className="mb-1 block text-sm font-medium text-zinc-300">
          Start Date & Time
        </label>
        <input
          id="date"
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="min-h-[44px] w-full rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:border-accent-500/60 focus:outline-none focus:ring-1 focus:ring-accent-500/40 sm:py-2.5"
        />
      </div>

      <div>
        <label htmlFor="endDate" className="mb-1 block text-sm font-medium text-zinc-300">
          End Date & Time <span className="text-zinc-500">(optional)</span>
        </label>
        <input
          id="endDate"
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          min={date || undefined}
          className="min-h-[44px] w-full rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:border-accent-500/60 focus:outline-none focus:ring-1 focus:ring-accent-500/40 sm:py-2.5"
        />
      </div>

      <div>
        <label htmlFor="location" className="mb-1 block text-sm font-medium text-zinc-300">
          Location
        </label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="min-h-[44px] w-full rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:border-accent-500/60 focus:outline-none focus:ring-1 focus:ring-accent-500/40 sm:py-2.5"
          placeholder="Venue name or address"
        />
      </div>

      <div>
        <label htmlFor="venue" className="mb-1 block text-sm font-medium text-zinc-300">
          Venue Map
        </label>
        <select
          id="venue"
          value={venueId}
          onChange={(e) => setVenueId(e.target.value)}
          className="min-h-[44px] w-full rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-4 py-3 text-zinc-100 focus:border-accent-500/60 focus:outline-none focus:ring-1 focus:ring-accent-500/40 sm:py-2.5"
        >
          <option value="">No venue map</option>
          {venues.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-zinc-500">
          Select a saved venue layout to use for this event.{" "}
          <Link href="/dashboard/venues" className="text-amber-500 hover:text-amber-400">
            Manage venues
          </Link>
        </p>
      </div>

      {/* Ticket Types */}
      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-50">Ticket Types</h3>
          <button
            type="button"
            onClick={addTicketType}
            className="text-sm font-medium text-accent-400 hover:text-accent-300"
          >
            + Add type
          </button>
        </div>
        <div className="space-y-4">
          {ticketTypes.map((tt, i) => (
            <div key={i} className="flex flex-wrap items-end gap-4 rounded-lg border border-zinc-700/60 p-4">
              <div className="min-w-0 flex-1">
                <label className="mb-1 block text-xs text-zinc-500">Name</label>
                <input
                  type="text"
                  value={tt.name}
                  onChange={(e) => updateTicketType(i, "name", e.target.value)}
                  placeholder="e.g. VIP, General Admission"
                  className="w-full rounded-lg border border-zinc-700/60 bg-zinc-800/60 px-3 py-2 text-zinc-100"
                />
              </div>
              <div className="w-24">
                <label className="mb-1 block text-xs text-zinc-500">Price ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={tt.price}
                  onChange={(e) => updateTicketType(i, "price", parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-zinc-700/60 bg-zinc-800/60 px-3 py-2 text-zinc-100"
                />
              </div>
              <div className="w-24">
                <label className="mb-1 block text-xs text-zinc-500">Qty</label>
                <input
                  type="number"
                  min="0"
                  value={tt.quantity ?? ""}
                  onChange={(e) =>
                    updateTicketType(
                      i,
                      "quantity",
                      e.target.value === "" ? null : parseInt(e.target.value, 10) || 0
                    )
                  }
                  placeholder="∞"
                  className="w-full rounded-lg border border-zinc-700/60 bg-zinc-800/60 px-3 py-2 text-zinc-100"
                />
              </div>
              <button
                type="button"
                onClick={() => removeTicketType(i)}
                className="rounded px-2 py-1 text-red-400 hover:bg-red-500/10"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Promo Codes */}
      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-50">Promo Codes</h3>
          <button
            type="button"
            onClick={addPromoCode}
            className="text-sm font-medium text-accent-400 hover:text-accent-300"
          >
            + Add code
          </button>
        </div>
        <div className="space-y-4">
          {promoCodes.length === 0 ? (
            <p className="text-sm text-zinc-500">No promo codes yet.</p>
          ) : (
            promoCodes.map((pc, i) => (
              <div key={i} className="flex flex-wrap items-end gap-4 rounded-lg border border-zinc-700/60 p-4">
                <div className="w-40">
                  <label className="mb-1 block text-xs text-zinc-500">Code</label>
                  <input
                    type="text"
                    value={pc.code}
                    onChange={(e) => updatePromoCode(i, "code", e.target.value.toUpperCase())}
                    placeholder="EARLYBIRD"
                    className="w-full rounded-lg border border-zinc-700/60 bg-zinc-800/60 px-3 py-2 text-zinc-100 uppercase"
                  />
                </div>
                <div className="w-28">
                  <label className="mb-1 block text-xs text-zinc-500">Type</label>
                  <select
                    value={pc.discountType}
                    onChange={(e) => updatePromoCode(i, "discountType", e.target.value as "PERCENT" | "FLAT")}
                    className="w-full rounded-lg border border-zinc-700/60 bg-zinc-800/60 px-3 py-2 text-zinc-100"
                  >
                    <option value="PERCENT">Percent</option>
                    <option value="FLAT">Flat $</option>
                  </select>
                </div>
                <div className="w-24">
                  <label className="mb-1 block text-xs text-zinc-500">
                    {pc.discountType === "PERCENT" ? "Value (%)" : "Value ($)"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step={pc.discountType === "PERCENT" ? 1 : 0.01}
                    value={pc.discountValue}
                    onChange={(e) =>
                      updatePromoCode(
                        i,
                        "discountValue",
                        pc.discountType === "PERCENT"
                          ? parseInt(e.target.value, 10) || 0
                          : parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full rounded-lg border border-zinc-700/60 bg-zinc-800/60 px-3 py-2 text-zinc-100"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removePromoCode(i)}
                  className="rounded px-2 py-1 text-red-400 hover:bg-red-500/10"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <label htmlFor="status" className="mb-1 block text-sm font-medium text-zinc-300">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED")}
          className="min-h-[44px] w-full rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-4 py-3 text-zinc-100 focus:border-accent-500/60 focus:outline-none focus:ring-1 focus:ring-accent-500/40 sm:py-2.5"
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">
          Header Image
        </label>
        <div className="space-y-3">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageUpload}
            disabled={uploading}
            className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded-lg file:border-0 file:bg-accent-500/20 file:px-4 file:py-2 file:text-accent-400 file:hover:bg-accent-500/30"
          />
          {flyerUrl && (
            <div className="relative h-32 w-48 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800">
              <img
                src={flyerUrl}
                alt="Header preview"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setFlyerUrl("")}
                className="absolute right-2 top-2 rounded bg-red-500/80 px-2 py-1 text-xs text-white hover:bg-red-500"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:gap-4">
        <button
          type="submit"
          disabled={saving}
          className="min-h-[48px] rounded-xl bg-accent-500 px-6 py-3 font-medium text-zinc-950 transition-colors hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation sm:py-2.5"
        >
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Event"}
        </button>
        <Link
          href="/dashboard/events"
          className="flex min-h-[48px] items-center justify-center rounded-xl border border-zinc-600 px-6 py-3 font-medium text-zinc-300 transition-colors hover:bg-zinc-800 touch-manipulation sm:py-2.5"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
