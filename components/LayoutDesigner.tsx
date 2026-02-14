"use client";

import { useRef, useState, useCallback, useEffect } from "react";

const CELL_SIZE = 32;
const TABLE_ZONE_ROWS = 8; // Tables go in rows [stageHeight, stageHeight+TABLE_ZONE_ROWS)

export type SectionConfig = {
  name: string;
  rows: number;
  cols: number;
  posX: number;
  posY: number;
  color?: string;
};

export type TableConfig = {
  name: string;
  seatCount: number;
  posX: number;
  posY: number;
  color?: string;
};

export type StageConfig = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type LayoutDesignerProps = {
  gridCols: number;
  gridRows: number;
  stage: StageConfig;
  sections: SectionConfig[];
  tables: TableConfig[];
  onStageChange: (stage: StageConfig) => void;
  onSectionChange: (index: number, posX: number, posY: number) => void;
  onTableChange: (index: number, posX: number, posY: number) => void;
};

type DragState = {
  type: "section" | "table";
  index: number;
  startX: number;
  startY: number;
  startPosX: number;
  startPosY: number;
};

export function LayoutDesigner({
  gridCols,
  gridRows,
  stage,
  sections,
  tables,
  onStageChange,
  onSectionChange,
  onTableChange,
}: LayoutDesignerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

  const getGridPos = useCallback(
    (clientX: number, clientY: number): { col: number; row: number } => {
      const el = containerRef.current;
      if (!el) return { col: 0, row: 0 };
      const rect = el.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const col = Math.max(0, Math.min(gridCols - 1, Math.floor(x / CELL_SIZE)));
      const row = Math.max(0, Math.min(gridRows - 1, Math.floor(y / CELL_SIZE)));
      return { col, row };
    },
    [gridCols, gridRows]
  );

  const stageHeight = Math.max(1, stage.height);
  const tableZoneMinY = stageHeight;
  const tableZoneMaxY = stageHeight + TABLE_ZONE_ROWS - 1;
  const sectionMinY = stageHeight + TABLE_ZONE_ROWS;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, type: "section" | "table", index: number) => {
      e.preventDefault();
      if (type === "section") {
        setDrag({
          type: "section",
          index,
          startX: e.clientX,
          startY: e.clientY,
          startPosX: sections[index].posX,
          startPosY: sections[index].posY,
        });
      } else {
        setDrag({
          type: "table",
          index,
          startX: e.clientX,
          startY: e.clientY,
          startPosX: tables[index].posX,
          startPosY: tables[index].posY,
        });
      }
    },
    [sections, tables]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, type: "section" | "table", index: number) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (type === "section") {
        setDrag({
          type: "section",
          index,
          startX: touch.clientX,
          startY: touch.clientY,
          startPosX: sections[index].posX,
          startPosY: sections[index].posY,
        });
      } else {
        setDrag({
          type: "table",
          index,
          startX: touch.clientX,
          startY: touch.clientY,
          startPosX: tables[index].posX,
          startPosY: tables[index].posY,
        });
      }
    },
    [sections, tables]
  );

  const applyDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (!drag) return;
      const deltaCol = Math.round((clientX - drag.startX) / CELL_SIZE);
      const deltaRow = Math.round((clientY - drag.startY) / CELL_SIZE);
      const newX = Math.max(0, Math.min(gridCols - 1, drag.startPosX + deltaCol));
      const newY = Math.max(0, Math.min(gridRows - 1, drag.startPosY + deltaRow));

      if (drag.type === "section") {
        const sec = sections[drag.index];
        const maxX = Math.max(0, gridCols - sec.cols);
        const minY = sectionMinY;
        const maxY = Math.max(sectionMinY, gridRows - sec.rows);
        onSectionChange(
          drag.index,
          Math.min(newX, maxX),
          Math.max(minY, Math.min(newY, maxY))
        );
      } else {
        const minY = tableZoneMinY;
        const maxY = Math.min(tableZoneMaxY, gridRows - 1);
        onTableChange(
          drag.index,
          newX,
          Math.max(minY, Math.min(newY, maxY))
        );
      }
    },
    [drag, gridCols, gridRows, sections, sectionMinY, tableZoneMinY, tableZoneMaxY, onSectionChange, onTableChange]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      applyDrag(e.clientX, e.clientY);
    },
    [applyDrag]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      const touch = e.touches[0];
      applyDrag(touch.clientX, touch.clientY);
    },
    [applyDrag]
  );

  const handleEnd = useCallback(() => {
    setDrag(null);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleEnd);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [handleMouseMove, handleTouchMove, handleEnd]);

  const width = gridCols * CELL_SIZE;
  const height = gridRows * CELL_SIZE;

  return (
    <div className="overflow-auto rounded-lg border border-zinc-700 bg-zinc-900/30 p-4">
      <p className="mb-2 text-xs text-zinc-500">
        Stage is fixed at top. Drag tables (in front) and sections (stadium seating) to reposition.
      </p>
      <div
        ref={containerRef}
        className="relative select-none"
        style={{
          width,
          height,
          touchAction: "none",
          backgroundImage: `
            linear-gradient(to right, rgb(63 63 70 / 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(63 63 70 / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
        }}
      >
        {/* Stage - fixed at top, not draggable */}
        {stage.width > 0 && stage.height > 0 && (
          <div
            className="absolute left-0 top-0 flex cursor-default items-center justify-center rounded-b border-2 border-amber-500/50 bg-amber-600/80 text-amber-100"
            style={{
              left: 2,
              top: 2,
              width: stage.width * CELL_SIZE - 4,
              height: stage.height * CELL_SIZE - 4,
            }}
          >
            <span className="text-sm font-medium">STAGE</span>
          </div>
        )}

        {/* Sections */}
        {sections.map((sec, i) => {
          const bg = sec.color || "#6366f1";
          return (
            <div
              key={i}
              onMouseDown={(e) => handleMouseDown(e, "section", i)}
              onTouchStart={(e) => handleTouchStart(e, "section", i)}
              className={`absolute cursor-grab rounded border-2 px-2 py-1 transition-shadow hover:shadow-lg ${
                drag?.type === "section" && drag.index === i
                  ? "cursor-grabbing ring-2 ring-white/50"
                  : ""
              }`}
              style={{
                left: sec.posX * CELL_SIZE + 2,
                top: sec.posY * CELL_SIZE + 2,
                width: sec.cols * CELL_SIZE - 4,
                height: sec.rows * CELL_SIZE - 4,
                backgroundColor: `${bg}cc`,
                borderColor: `${bg}99`,
              }}
            >
              <span className="truncate text-xs font-medium text-white drop-shadow">
                {sec.name || `Section ${i + 1}`}
              </span>
            </div>
          );
        })}

        {/* Tables */}
        {tables.map((tab, i) => {
          const bg = tab.color || "#22c55e";
          return (
            <div
              key={i}
              onMouseDown={(e) => handleMouseDown(e, "table", i)}
              onTouchStart={(e) => handleTouchStart(e, "table", i)}
              className={`absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded-full border-2 text-xs font-medium text-white transition-shadow hover:shadow-lg ${
                drag?.type === "table" && drag.index === i
                  ? "cursor-grabbing ring-2 ring-white/50"
                  : ""
              }`}
              style={{
                left: tab.posX * CELL_SIZE + CELL_SIZE / 2,
                top: tab.posY * CELL_SIZE + CELL_SIZE / 2,
                backgroundColor: `${bg}cc`,
                borderColor: `${bg}99`,
              }}
            >
              {tab.name || i + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
}
