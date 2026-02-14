"use client";

import { useState, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { SectionView, type Seat } from "./SectionView";
import { TableView } from "./TableView";

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

type SeatingChartProps = {
  venueMap: VenueMap;
};

const PRICE_PER_SEAT = 50;

function getSeatLabel(seat: Seat, venueMap: VenueMap): string {
  if (seat.sectionId) {
    const section = venueMap.sections.find((s) => s.id === seat.sectionId);
    return section ? `${section.name}, Seat ${seat.seatNumber}` : seat.seatNumber;
  }
  if (seat.tableId) {
    const table = venueMap.tables.find((t) => t.id === seat.tableId);
    return table ? `${table.name}, Seat ${seat.seatNumber}` : seat.seatNumber;
  }
  return seat.seatNumber;
}

export function SeatingChart({ venueMap }: SeatingChartProps) {
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedSeatIds = new Set(selectedSeats.map((s) => s.id));

  const handleSeatSelect = useCallback((seat: Seat) => {
    setSelectedSeats((prev) => {
      const isSelected = prev.some((s) => s.id === seat.id);
      if (isSelected) {
        return prev.filter((s) => s.id !== seat.id);
      }
      return [...prev, seat];
    });
  }, []);

  const totalPrice = selectedSeats.length * PRICE_PER_SEAT;

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-zinc-50">{venueMap.name}</h2>

      {venueMap.sections.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-500">
            Sections
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {venueMap.sections.map((section) => (
              <SectionView
                key={section.id}
                section={section}
                selectedSeatIds={selectedSeatIds}
                onSeatSelect={handleSeatSelect}
              />
            ))}
          </div>
        </div>
      )}

      {venueMap.tables.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-500">
            Tables
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {venueMap.tables.map((table) => (
              <TableView
                key={table.id}
                table={table}
                selectedSeatIds={selectedSeatIds}
                onSeatSelect={handleSeatSelect}
              />
            ))}
          </div>
        </div>
      )}

      <div className="sticky bottom-0 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <h3 className="mb-3 text-lg font-semibold text-zinc-50">
          Checkout
        </h3>
        {selectedSeats.length > 0 ? (
          <>
            <ul className="mb-4 space-y-1 text-sm text-zinc-300">
              {selectedSeats.map((seat) => (
                <li key={seat.id}>
                  {getSeatLabel(seat, venueMap)}
                </li>
              ))}
            </ul>
            <p className="mb-4 text-zinc-400">
              Total:{" "}
              <span className="font-semibold text-zinc-50">
                ${totalPrice.toFixed(2)}
              </span>{" "}
              ({selectedSeats.length} seat
              {selectedSeats.length !== 1 ? "s" : ""} × ${PRICE_PER_SEAT})
            </p>
          </>
        ) : (
          <p className="mb-4 text-sm text-zinc-500">
            Select at least one seat to continue.
          </p>
        )}
        {selectedSeats.length > 0 && (
          <div className="mb-4 space-y-3">
            <div>
              <label
                htmlFor="attendee-name"
                className="mb-1 block text-sm font-medium text-zinc-300"
              >
                Name
              </label>
              <input
                id="attendee-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label
                htmlFor="attendee-email"
                className="mb-1 block text-sm font-medium text-zinc-300"
              >
                Email
              </label>
              <input
                id="attendee-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        )}
        {error && (
          <p className="mb-4 text-sm text-red-400">{error}</p>
        )}
        <button
          type="button"
          disabled={
            selectedSeats.length === 0 ||
            !name.trim() ||
            !email.trim() ||
            isLoading
          }
          onClick={async () => {
            if (selectedSeats.length === 0 || !name.trim() || !email.trim())
              return;
            setIsLoading(true);
            setError(null);
            try {
              const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  seatIds: selectedSeats.map((s) => s.id),
                  eventId: venueMap.eventId,
                  name: name.trim(),
                  email: email.trim(),
                }),
              });
              const data = await res.json();
              if (!res.ok) {
                throw new Error(data.error || "Failed to create checkout");
              }
              const { sessionId, url } = data;
              if (url) {
                window.location.href = url;
                return;
              }
              const publishableKey =
                process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
              if (!publishableKey) throw new Error("Stripe is not configured");
              const stripe = await loadStripe(publishableKey);
              const redirectToCheckout = (stripe as { redirectToCheckout?: (opts: { sessionId: string }) => Promise<{ error?: { message?: string } }> })?.redirectToCheckout;
              if (redirectToCheckout) {
                const { error: redirectError } =
                  await redirectToCheckout({ sessionId });
                if (redirectError)
                  throw new Error(redirectError.message || "Redirect failed");
              } else {
                throw new Error("Unable to redirect to payment");
              }
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "Something went wrong"
              );
            } finally {
              setIsLoading(false);
            }
          }}
          className="w-full rounded-lg bg-amber-500 px-4 py-3 font-semibold text-zinc-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-500"
        >
          {isLoading ? "Redirecting..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}
