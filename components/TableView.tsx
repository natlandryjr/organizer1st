"use client";

import type { Seat } from "./SectionView";

type Table = {
  id: string;
  name: string;
  seatCount: number;
  venueMapId: string;
  seats: Seat[];
};

type TableViewProps = {
  table: Table;
  selectedSeatIds: Set<string>;
  onSeatSelect: (seat: Seat) => void;
};

export function TableView({
  table,
  selectedSeatIds,
  onSeatSelect,
}: TableViewProps) {
  const { name, seats } = table;

  const getSeatButtonClasses = (seat: (typeof seats)[0]) => {
    const isBooked = seat.status === "BOOKED";
    const isLocked = seat.status === "LOCKED";
    const isSelected = selectedSeatIds.has(seat.id);

    if (isBooked) {
      return "cursor-not-allowed bg-red-700 text-zinc-200";
    }
    if (isLocked) {
      return "cursor-not-allowed bg-zinc-600 text-zinc-400";
    }
    if (isSelected) {
      return "bg-blue-500 text-white hover:bg-blue-600";
    }
    return "bg-gray-500 text-white hover:bg-gray-400";
  };

  return (
    <div className="relative flex h-44 w-44 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      {/* Central table circle */}
      <div className="absolute flex h-20 w-20 items-center justify-center rounded-full bg-zinc-600 text-center text-sm font-medium text-zinc-200">
        {name}
      </div>

      {/* Seat circles arranged around the table */}
      {seats.map((seat, i) => {
        const isBooked = seat.status === "BOOKED";
        const isLocked = seat.status === "LOCKED";
        const isAvailable = seat.status === "AVAILABLE";
        const angle = (i / seats.length) * 2 * Math.PI - Math.PI / 2;
        const radius = 56;
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
              onClick={() => isAvailable && onSeatSelect(seat)}
              disabled={isBooked || isLocked}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-medium transition-colors ${getSeatButtonClasses(seat)}`}
            >
              {seat.seatNumber}
            </button>
          </div>
        );
      })}
    </div>
  );
}
