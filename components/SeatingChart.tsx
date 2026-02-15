"use client";

import { useState, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { SectionView, type Seat } from "./SectionView";
import { TableView } from "./TableView";
import { FloorPlanView } from "./FloorPlanView";
import { SeatLegend } from "./SeatLegend";

type TicketType = {
  id: string;
  name: string;
  price: number; // cents
};

type Section = {
  id: string;
  name: string;
  rows: number;
  cols: number;
  posX?: number;
  posY?: number;
  venueMapId: string;
  ticketType?: TicketType | null;
  seats: Seat[];
};

type Table = {
  id: string;
  name: string;
  seatCount: number;
  posX?: number;
  posY?: number;
  venueMapId: string;
  ticketType?: TicketType | null;
  seats: Seat[];
};

type VenueMap = {
  id: string;
  name: string;
  eventId: string;
  gridCols?: number;
  gridRows?: number;
  stageX?: number;
  stageY?: number;
  stageWidth?: number;
  stageHeight?: number;
  sections: Section[];
  tables: Table[];
};

type SeatingChartProps = {
  venueMap: VenueMap;
  maxSeats?: number | null;
  bookedCount?: number;
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

const DEFAULT_PRICE_CENTS = 5000; // $50 fallback

function getSeatPriceCents(seat: Seat, venueMap: VenueMap): number {
  if (seat.sectionId) {
    const section = venueMap.sections.find((s) => s.id === seat.sectionId);
    return section?.ticketType?.price ?? DEFAULT_PRICE_CENTS;
  }
  if (seat.tableId) {
    const table = venueMap.tables.find((t) => t.id === seat.tableId);
    return table?.ticketType?.price ?? DEFAULT_PRICE_CENTS;
  }
  return DEFAULT_PRICE_CENTS;
}

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

export function SeatingChart({
  venueMap,
  maxSeats = null,
  bookedCount = 0,
}: SeatingChartProps) {
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState<{
    code: string;
    discountType: "PERCENT" | "FLAT";
    discountValue: number;
  } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
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

  const subtotalCents = selectedSeats.reduce(
    (sum, s) => sum + getSeatPriceCents(s, venueMap),
    0
  );
  let discountCents = 0;
  if (promoApplied) {
    if (promoApplied.discountType === "PERCENT") {
      discountCents = Math.round(
        subtotalCents * Math.min(100, promoApplied.discountValue) / 100
      );
    } else {
      discountCents = Math.min(subtotalCents, promoApplied.discountValue);
    }
  }
  const totalCents = Math.max(0, subtotalCents - discountCents);
  const subtotalDollars = subtotalCents / 100;
  const discountDollars = discountCents / 100;
  const totalDollars = totalCents / 100;
  const useLayout = usePositionedLayout(venueMap);
  const atCapacity =
    maxSeats != null && maxSeats > 0 && bookedCount >= maxSeats;
  const wouldExceedCapacity =
    maxSeats != null &&
    maxSeats > 0 &&
    bookedCount + selectedSeats.length > maxSeats;

  const normalizedVenueMap = {
    ...venueMap,
    gridCols: venueMap.gridCols ?? 24,
    gridRows: venueMap.gridRows ?? 24,
    stageX: venueMap.stageX ?? 0,
    stageY: venueMap.stageY ?? 0,
    stageWidth: venueMap.stageWidth ?? 0,
    stageHeight: venueMap.stageHeight ?? 0,
    sections: venueMap.sections.map((s) => ({
      ...s,
      posX: s.posX ?? 0,
      posY: s.posY ?? 0,
    })),
    tables: venueMap.tables.map((t) => ({
      ...t,
      posX: t.posX ?? 0,
      posY: t.posY ?? 0,
    })),
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-zinc-50">{venueMap.name}</h2>
      <SeatLegend />

      {useLayout ? (
        <FloorPlanView
          venueMap={normalizedVenueMap}
          selectedSeatIds={selectedSeatIds}
          onSeatSelect={handleSeatSelect}
        />
      ) : (
        <>
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
        </>
      )}

      <div className="sticky bottom-0 z-10 overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/95 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-zinc-50">
          Checkout
          {selectedSeats.length > 0 && (
            <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold text-zinc-950">
              {selectedSeats.length}
            </span>
          )}
        </h3>
        {selectedSeats.length > 0 ? (
          <>
            <ul className="mb-4 space-y-1 text-sm text-zinc-300">
              {selectedSeats.map((seat) => (
                <li key={seat.id} className="flex items-center justify-between gap-2">
                  <span className="min-w-0 flex-1 truncate">{getSeatLabel(seat, venueMap)}</span>
                  <span className="shrink-0 text-zinc-400">
                    ${(getSeatPriceCents(seat, venueMap) / 100).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSeatSelect(seat)}
                    className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-red-400 touch-manipulation sm:min-h-0 sm:min-w-0"
                    aria-label={`Remove ${getSeatLabel(seat, venueMap)}`}
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
            <div className="mb-4 space-y-1 text-sm">
              <p className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>${subtotalDollars.toFixed(2)}</span>
              </p>
              {promoApplied && (
                <p className="flex justify-between text-emerald-400">
                  <span>Discount ({promoApplied.code})</span>
                  <span>-${discountDollars.toFixed(2)}</span>
                </p>
              )}
              <p className="flex justify-between text-lg font-semibold text-zinc-50">
                <span>Total</span>
                <span>${totalDollars.toFixed(2)}</span>
              </p>
            </div>
            {selectedSeats.length > 0 && (
              <div className="mb-4">
                {promoApplied ? (
                  <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
                    <span className="text-sm text-emerald-400">
                      Promo applied: {promoApplied.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPromoApplied(null);
                        setPromoError(null);
                      }}
                      className="text-xs text-zinc-400 hover:text-zinc-200"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value.toUpperCase());
                        setPromoError(null);
                      }}
                      placeholder="Promo code"
                      className="min-h-[44px] flex-1 rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40 sm:py-2.5"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const code = promoCode.trim().toUpperCase();
                        if (!code) return;
                        setPromoError(null);
                        try {
                          const res = await fetch(
                            `/api/events/${venueMap.eventId}/promo?code=${encodeURIComponent(code)}`
                          );
                          const data = await res.json();
                          if (!res.ok) {
                            setPromoError(data.error ?? "Invalid promo code");
                            return;
                          }
                          setPromoApplied({
                            code: data.code,
                            discountType: data.discountType,
                            discountValue: data.discountValue,
                          });
                        } catch {
                          setPromoError("Failed to validate promo code");
                        }
                      }}
                      className="min-h-[44px] shrink-0 rounded-xl border border-amber-500/50 bg-amber-500/20 px-4 py-3 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/30 touch-manipulation sm:py-2.5"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {promoError && (
                  <p className="mt-1 text-xs text-red-400">{promoError}</p>
                )}
              </div>
            )}
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
                className="min-h-[44px] w-full rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40 sm:py-2.5"
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
                className="min-h-[44px] w-full rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40 sm:py-2.5"
              />
            </div>
          </div>
        )}
        {atCapacity && (
          <p className="mb-4 text-sm font-medium text-amber-400">
            This event is sold out.
          </p>
        )}
        {wouldExceedCapacity && !atCapacity && (
          <p className="mb-4 text-sm text-amber-400">
            Only {maxSeats! - bookedCount} seat
            {maxSeats! - bookedCount !== 1 ? "s" : ""} remaining. Reduce your
            selection.
          </p>
        )}
        {error && (
          <div className="mb-4 rounded-lg border border-red-800/50 bg-red-900/20 p-3 text-sm text-red-400">{error}</div>
        )}
        <button
          type="button"
          disabled={
            selectedSeats.length === 0 ||
            !name.trim() ||
            !email.trim() ||
            isLoading ||
            atCapacity ||
            wouldExceedCapacity
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
                  ...(promoApplied && { promoCode: promoApplied.code }),
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
          className="btn-glow min-h-[48px] w-full rounded-xl bg-amber-500 px-4 py-3 font-semibold text-zinc-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600 touch-manipulation"
        >
          {isLoading ? "Redirecting..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}
