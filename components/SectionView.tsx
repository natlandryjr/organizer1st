"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
export type Seat = {
  id: string;
  seatNumber: string;
  status: string;
  sectionId: string | null;
  tableId: string | null;
  bookingId: string | null;
};

type Section = {
  id: string;
  name: string;
  rows: number;
  cols: number;
  venueMapId: string;
  seats: Seat[];
};

type SectionViewProps = {
  section: Section;
  selectedSeatIds: Set<string>;
  onSeatSelect: (seat: Seat) => void;
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
}: SectionViewProps) {
  const { name, cols, seats } = section;
  const sortedSeats = [...seats].sort(
    (a, b) => getSeatSortKey(a.seatNumber) - getSeatSortKey(b.seatNumber)
  );

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <h3 className="mb-3 text-sm font-medium text-zinc-300">{name}</h3>
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {sortedSeats.map((seat) => {
          const isBooked = seat.status === "BOOKED";
          const isLocked = seat.status === "LOCKED";
          const isAvailable = seat.status === "AVAILABLE";
          const isSelected = selectedSeatIds.has(seat.id);

          const getButtonClasses = () => {
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
            <button
              key={seat.id}
              type="button"
              onClick={() => isAvailable && onSeatSelect(seat)}
              disabled={isBooked || isLocked}
              className={`flex h-8 w-8 items-center justify-center rounded text-xs font-medium transition-colors ${getButtonClasses()}`}
            >
              {seat.seatNumber}
            </button>
          );
        })}
      </div>
    </div>
  );
}
