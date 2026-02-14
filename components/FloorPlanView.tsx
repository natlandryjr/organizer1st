"use client";

import { useRef, useEffect, useState } from "react";
import { SectionView, type Seat } from "./SectionView";
import { TableView } from "./TableView";

type Section = {
  id: string;
  name: string;
  rows: number;
  cols: number;
  posX: number;
  posY: number;
  venueMapId: string;
  color?: string | null;
  seats: Seat[];
};

type Table = {
  id: string;
  name: string;
  seatCount: number;
  posX: number;
  posY: number;
  venueMapId: string;
  color?: string | null;
  seats: Seat[];
};

type VenueMap = {
  id: string;
  name: string;
  eventId: string;
  gridCols: number;
  gridRows: number;
  stageX: number;
  stageY: number;
  stageWidth: number;
  stageHeight: number;
  sections: Section[];
  tables: Table[];
};

type FloorPlanViewProps = {
  venueMap: VenueMap;
  selectedSeatIds: Set<string>;
  onSeatSelect: (seat: Seat) => void;
  /** When true, HELD seats can be selected (e.g. admin adding attendee) */
  allowHeldSelection?: boolean;
};

const CELL_SIZE = 48;

export function FloorPlanView({
  venueMap,
  selectedSeatIds,
  onSeatSelect,
  allowHeldSelection = false,
}: FloorPlanViewProps) {
  const {
    gridCols,
    gridRows,
    stageX,
    stageY,
    stageWidth,
    stageHeight,
    sections,
    tables,
  } = venueMap;

  const width = gridCols * CELL_SIZE;
  const height = gridRows * CELL_SIZE;

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const containerWidth = entry.contentRect.width - 32; // subtract padding
        setScale(Math.min(1, containerWidth / width));
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div ref={containerRef} className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <div
        style={{
          width: width * scale,
          height: height * scale,
        }}
      >
        <div
          className="relative origin-top-left"
          style={{
            width,
            height,
            transform: `scale(${scale})`,
          }}
        >
          {/* Stage */}
          {stageWidth > 0 && stageHeight > 0 && (
            <div
              className="absolute flex items-center justify-center rounded bg-amber-700/80 text-amber-100"
              style={{
                left: stageX * CELL_SIZE,
                top: stageY * CELL_SIZE,
                width: stageWidth * CELL_SIZE,
                height: stageHeight * CELL_SIZE,
              }}
            >
              <span className="text-sm font-medium">STAGE</span>
            </div>
          )}

          {/* Sections */}
          {sections.map((section) => (
            <div
              key={section.id}
              className="absolute"
              style={{
                left: section.posX * CELL_SIZE,
                top: section.posY * CELL_SIZE,
              }}
            >
              <SectionView
                section={section}
                selectedSeatIds={selectedSeatIds}
                onSeatSelect={onSeatSelect}
                allowHeldSelection={allowHeldSelection}
              />
            </div>
          ))}

          {/* Tables */}
          {tables.map((table) => (
            <div
              key={table.id}
              className="absolute"
              style={{
                left: table.posX * CELL_SIZE - 88,
                top: table.posY * CELL_SIZE - 88,
              }}
            >
              <TableView
                table={table}
                selectedSeatIds={selectedSeatIds}
                onSeatSelect={onSeatSelect}
                allowHeldSelection={allowHeldSelection}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
