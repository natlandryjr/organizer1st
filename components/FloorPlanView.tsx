"use client";

import { useRef, useEffect, useState, useCallback } from "react";
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
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.15;

export function FloorPlanView({
  venueMap,
  selectedSeatIds,
  onSeatSelect,
  allowHeldSelection = false,
}: FloorPlanViewProps) {
  const {
    gridCols,
    gridRows,
    stageY,
    stageWidth,
    stageHeight,
    sections,
    tables,
  } = venueMap;

  // Compute the minimum height needed to fit all sections and tables without overlap
  const minRequiredRows = (() => {
    const stageBottom = stageY + stageHeight;
    let maxRow = stageBottom;
    for (const section of sections) {
      const sectionBottom = section.posY + section.rows;
      if (sectionBottom > maxRow) maxRow = sectionBottom;
    }
    for (const table of tables) {
      // Tables are centered; account for widget size in grid cells
      const tableBottomRow = table.posY + Math.ceil(208 / CELL_SIZE);
      if (tableBottomRow > maxRow) maxRow = tableBottomRow;
    }
    return maxRow + 2; // padding
  })();
  const effectiveGridRows = Math.max(gridRows, minRequiredRows);

  const contentWidth = gridCols * CELL_SIZE;
  const contentHeight = effectiveGridRows * CELL_SIZE;

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const initialFitDone = useRef(false);

  // Observe container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          w: entry.contentRect.width,
          h: entry.contentRect.height,
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Compute fit-to-view zoom once we know the container size
  const fitZoom = containerSize.w > 0
    ? Math.min(
        (containerSize.w - 32) / contentWidth,
        (containerSize.h > 100 ? containerSize.h - 32 : 600) / contentHeight,
        1
      )
    : 1;

  // Set initial zoom to fit
  useEffect(() => {
    if (containerSize.w > 0 && !initialFitDone.current) {
      initialFitDone.current = true;
      setZoom(fitZoom);
      setPan({ x: 0, y: 0 });
    }
  }, [containerSize.w, fitZoom]);

  const clampPan = useCallback(
    (x: number, y: number, z: number) => {
      const scaledW = contentWidth * z;
      const scaledH = contentHeight * z;
      const maxPanX = Math.max(0, (scaledW - containerSize.w + 32) / 2);
      const maxPanY = Math.max(0, (scaledH - (containerSize.h || 600) + 32) / 2);
      return {
        x: Math.max(-maxPanX, Math.min(maxPanX, x)),
        y: Math.max(-maxPanY, Math.min(maxPanY, y)),
      };
    },
    [contentWidth, contentHeight, containerSize.w, containerSize.h]
  );

  const handleZoom = useCallback(
    (delta: number) => {
      setZoom((prev) => {
        const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta));
        setPan((p) => clampPan(p.x, p.y, next));
        return next;
      });
    },
    [clampPan]
  );

  const resetView = useCallback(() => {
    setZoom(fitZoom);
    setPan({ x: 0, y: 0 });
  }, [fitZoom]);

  // Mouse wheel zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        handleZoom(delta);
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [handleZoom]);

  // Drag to pan
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only pan on middle-click or when clicking the background
      if (e.button !== 0 && e.button !== 1) return;
      const target = e.target as HTMLElement;
      // Don't start drag if clicking a seat button
      if (target.closest("button")) return;
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [pan]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPan(clampPan(dragStart.current.panX + dx, dragStart.current.panY + dy, zoom));
    },
    [isDragging, zoom, clampPan]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch pinch-to-zoom
  const lastPinchDist = useRef<number | null>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (lastPinchDist.current !== null) {
          const delta = (dist - lastPinchDist.current) * 0.005;
          handleZoom(delta);
        }
        lastPinchDist.current = dist;
      }
    };

    const onTouchEnd = () => {
      lastPinchDist.current = null;
    };

    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [handleZoom]);

  const zoomPercent = Math.round(zoom * 100);

  // Stage bottom edge in pixels — nothing should render above this
  const stageBottomPx = (stageY + stageHeight) * CELL_SIZE;
  // TableView is h-52 (208px) on mobile, sm:h-44 (176px) — use the larger to be safe
  const TABLE_WIDGET_SIZE = 208;
  const TABLE_HALF = TABLE_WIDGET_SIZE / 2;

  return (
    <div className="space-y-2">
      {/* Zoom controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleZoom(-ZOOM_STEP)}
          disabled={zoom <= MIN_ZOOM}
          className="flex h-8 w-8 items-center justify-center rounded border border-zinc-700 bg-zinc-800 text-zinc-300 transition-colors hover:bg-zinc-700 disabled:opacity-40"
          aria-label="Zoom out"
        >
          &minus;
        </button>
        <button
          type="button"
          onClick={resetView}
          className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-700"
          title="Reset to fit view"
        >
          {zoomPercent}%
        </button>
        <button
          type="button"
          onClick={() => handleZoom(ZOOM_STEP)}
          disabled={zoom >= MAX_ZOOM}
          className="flex h-8 w-8 items-center justify-center rounded border border-zinc-700 bg-zinc-800 text-zinc-300 transition-colors hover:bg-zinc-700 disabled:opacity-40"
          aria-label="Zoom in"
        >
          +
        </button>
        <span className="ml-2 text-xs text-zinc-500">
          Ctrl+Scroll to zoom &middot; Drag to pan
        </span>
      </div>

      {/* Venue viewport */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50"
        style={{
          height: Math.max(400, Math.min(contentHeight * fitZoom + 32, 700)),
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "none",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: contentWidth,
            height: contentHeight,
            transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          {/* Stage — centered at top */}
          {stageWidth > 0 && stageHeight > 0 && (
            <div
              className="absolute z-10 flex items-center justify-center rounded bg-amber-700/80 text-amber-100"
              style={{
                left: Math.max(0, (contentWidth - stageWidth * CELL_SIZE) / 2),
                top: stageY * CELL_SIZE,
                width: stageWidth * CELL_SIZE,
                height: stageHeight * CELL_SIZE,
              }}
            >
              <span className="text-sm font-medium">STAGE</span>
            </div>
          )}

          {/* Sections — clamped below stage */}
          {sections.map((section) => {
            const rawTop = section.posY * CELL_SIZE;
            const top = Math.max(rawTop, stageBottomPx);
            return (
              <div
                key={section.id}
                className="absolute"
                style={{
                  left: section.posX * CELL_SIZE,
                  top,
                }}
              >
                <SectionView
                  section={section}
                  selectedSeatIds={selectedSeatIds}
                  onSeatSelect={onSeatSelect}
                  allowHeldSelection={allowHeldSelection}
                />
              </div>
            );
          })}

          {/* Tables — centered on grid pos, clamped below stage */}
          {tables.map((table) => {
            const centerX = table.posX * CELL_SIZE;
            const centerY = table.posY * CELL_SIZE;
            const rawTop = centerY - TABLE_HALF;
            const top = Math.max(rawTop, stageBottomPx);
            return (
              <div
                key={table.id}
                className="absolute"
                style={{
                  left: centerX - TABLE_HALF,
                  top,
                }}
              >
                <TableView
                  table={table}
                  selectedSeatIds={selectedSeatIds}
                  onSeatSelect={onSeatSelect}
                  allowHeldSelection={allowHeldSelection}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
