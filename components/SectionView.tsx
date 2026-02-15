"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
export type Seat = {
  id: string;
  seatNumber: string;
  status: string;
  sectionId: string | null;
  tableId: string | null;
  bookingId: string | null;
  holdId?: string | null;
  hold?: { id: string; label: string } | null;
};

type Section = {
  id: string;
  name: string;
  rows: number;
  cols: number;
  venueMapId: string;
  color?: string | null;
  seats: Seat[];
};

type SectionViewProps = {
  section: Section;
  selectedSeatIds: Set<string>;
  onSeatSelect: (seat: Seat) => void;
  allowHeldSelection?: boolean;
};

function getSeatSortKey(seatNumber: string): number {
  const letter = seatNumber.charCodeAt(0) - 65;
  const num = parseInt(seatNumber.slice(1), 10) || 0;
  return letter * 1000 + num;
}

export function SectionView({
  section,
  selectedSeatIds,
  onSeatSelect,
  allowHeldSelection = false,
}: SectionViewProps) {
  const { name, cols, seats, color } = section;
  const sectionColor = color && /^#[0-9A-Fa-f]{6}$/.test(color) ? color : "#4b5563";
  const sortedSeats = [...seats].sort(
    (a, b) => getSeatSortKey(a.seatNumber) - getSeatSortKey(b.seatNumber)
  );

  return (
    <div
      className="rounded-lg border p-4"
      style={{
        backgroundColor: `${sectionColor}20`,
        borderColor: `${sectionColor}60`,
      }}
    >
      <h3
        className="mb-3 text-sm font-medium"
        style={{ color: sectionColor }}
      >
        {name}
      </h3>
      <div
        className="grid gap-1.5"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {sortedSeats.map((seat) => {
          const isBooked = seat.status === "BOOKED";
          const isLocked = seat.status === "LOCKED";
          const isHeld = seat.status === "HELD";
          const isAvailable = seat.status === "AVAILABLE";
          const isSelected = selectedSeatIds.has(seat.id);
          const canToggle =
            (isAvailable || isSelected || (allowHeldSelection && isHeld)) &&
            !isBooked &&
            !isLocked &&
            (allowHeldSelection || !isHeld);

          const getButtonClasses = () => {
            if (isBooked) {
              return "cursor-not-allowed bg-red-700 text-zinc-200";
            }
            if (isLocked) {
              return "cursor-not-allowed bg-zinc-600 text-zinc-400";
            }
            if (isHeld) {
              return "cursor-not-allowed bg-accent-600/80 text-accent-100";
            }
            if (isSelected) {
              return "bg-blue-500 text-white hover:bg-blue-600";
            }
            return "text-white hover:opacity-90";
          };

          const availableBg =
            isAvailable && !isSelected ? sectionColor : undefined;
          const holdLabel = seat.hold?.label;

          return (
            <button
              key={seat.id}
              type="button"
              onClick={() => canToggle && onSeatSelect(seat)}
              disabled={isBooked || isLocked || (!allowHeldSelection && isHeld)}
              title={isHeld && holdLabel ? `Held for: ${holdLabel}` : undefined}
              className={`flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded text-xs font-medium transition-colors touch-manipulation ${getButtonClasses()}`}
              style={availableBg ? { backgroundColor: availableBg } : undefined}
            >
              {seat.seatNumber}
            </button>
          );
        })}
      </div>
    </div>
  );
}
