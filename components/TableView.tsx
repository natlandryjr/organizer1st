"use client";

import type { Seat } from "./SectionView";

type Table = {
  id: string;
  name: string;
  seatCount: number;
  venueMapId: string;
  color?: string | null;
  seats: Seat[];
};

type TableViewProps = {
  table: Table;
  selectedSeatIds: Set<string>;
  onSeatSelect: (seat: Seat) => void;
  allowHeldSelection?: boolean;
};

export function TableView({
  table,
  selectedSeatIds,
  onSeatSelect,
  allowHeldSelection = false,
}: TableViewProps) {
  const { name, seats, color } = table;
  const tableColor = color && /^#[0-9A-Fa-f]{6}$/.test(color) ? color : "#4b5563";

  const getSeatButtonClasses = (seat: (typeof seats)[0]) => {
    const isBooked = seat.status === "BOOKED";
    const isLocked = seat.status === "LOCKED";
    const isHeld = seat.status === "HELD";
    const isSelected = selectedSeatIds.has(seat.id);

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

  const getSeatStyle = (seat: (typeof seats)[0]) => {
    const isBooked = seat.status === "BOOKED";
    const isLocked = seat.status === "LOCKED";
    const isHeld = seat.status === "HELD";
    const isSelected = selectedSeatIds.has(seat.id);
    if (isBooked || isLocked || isHeld || isSelected) return undefined;
    return { backgroundColor: tableColor };
  };

  const canToggleSeat = (seat: (typeof seats)[0]) => {
    const isAvailable = seat.status === "AVAILABLE";
    const isSelected = selectedSeatIds.has(seat.id);
    const isBooked = seat.status === "BOOKED";
    const isLocked = seat.status === "LOCKED";
    const isHeld = seat.status === "HELD";
    return (
      (isAvailable || isSelected || (allowHeldSelection && isHeld)) &&
      !isBooked &&
      !isLocked &&
      (allowHeldSelection || !isHeld)
    );
  };

  return (
    <div
      className="relative flex h-52 w-52 sm:h-44 sm:w-44 items-center justify-center rounded-lg border p-4"
      style={{
        backgroundColor: `${tableColor}20`,
        borderColor: `${tableColor}60`,
      }}
    >
      {/* Central table circle */}
      <div
        className="absolute flex h-20 w-20 items-center justify-center rounded-full text-center text-sm font-medium text-white"
        style={{ backgroundColor: tableColor }}
      >
        {name}
      </div>

      {/* Seat circles arranged around the table */}
      {seats.map((seat, i) => {
        const isBooked = seat.status === "BOOKED";
        const isLocked = seat.status === "LOCKED";
        const isHeld = seat.status === "HELD";
        const isAvailable = seat.status === "AVAILABLE";
        const canToggle = canToggleSeat(seat);
        const holdLabel = seat.hold?.label;
        const angle = (i / seats.length) * 2 * Math.PI - Math.PI / 2;
        const radius = 64;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <div
            key={seat.id}
            className="absolute left-1/2 top-1/2"
            style={{
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
            }}
          >
            <button
              type="button"
              onClick={() => canToggle && onSeatSelect(seat)}
              disabled={isBooked || isLocked || (!allowHeldSelection && isHeld)}
              title={isHeld && holdLabel ? `Held for: ${holdLabel}` : undefined}
              className={`flex h-11 w-11 sm:h-10 sm:w-10 items-center justify-center rounded-full text-xs font-medium transition-colors touch-manipulation ${getSeatButtonClasses(seat)}`}
              style={getSeatStyle(seat)}
            >
              {seat.seatNumber}
            </button>
          </div>
        );
      })}
    </div>
  );
}
