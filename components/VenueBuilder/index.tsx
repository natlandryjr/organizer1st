"use client";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SidebarItem } from "./SidebarItem";
import { VenueCanvas } from "./VenueCanvas";
import type { VenueLayout } from "./types";

type VenueBuilderProps = {
  layout: VenueLayout;
  onLayoutChange: (layout: VenueLayout) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

export function VenueBuilder({
  layout,
  onLayoutChange,
  selectedId,
  onSelect,
}: VenueBuilderProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex gap-6">
        <aside className="w-56 shrink-0 space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Components
          </h3>
          <SidebarItem
            type="SECTION"
            label="Section (10×10 Grid)"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            }
          />
          <SidebarItem
            type="TABLE"
            label="Table (Round)"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="8" />
              </svg>
            }
          />
          <SidebarItem
            type="STAGE"
            label="Stage (Rectangle)"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="8" width="20" height="8" rx="1" />
              </svg>
            }
          />
          <SidebarItem
            type="TEXT"
            label="Text Label"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7V4h16v3M9 20h6M12 4v16" />
              </svg>
            }
          />
        </aside>

        <div className="min-w-0 flex-1">
          <VenueCanvas
            layout={layout}
            selectedId={selectedId}
            onLayoutChange={onLayoutChange}
            onSelect={onSelect}
            scale={0.9}
          />
        </div>
      </div>
    </DndProvider>
  );
}
