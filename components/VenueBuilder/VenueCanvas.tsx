"use client";

import { useCallback, useRef } from "react";
import { useDrop } from "react-dnd";
import { CanvasComponent } from "./CanvasComponent";
import type { VenueComponent, VenueComponentType, VenueLayout } from "./types";
import { DEFAULT_COMPONENTS } from "./types";

const SIDEBAR_ITEM_TYPE = "SIDEBAR_COMPONENT";
const CANVAS_ITEM_TYPE = "CANVAS_COMPONENT";

function generateId() {
  return `comp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

type VenueCanvasProps = {
  layout: VenueLayout;
  selectedId: string | null;
  onLayoutChange: (layout: VenueLayout) => void;
  onSelect: (id: string | null) => void;
  scale?: number;
};

export function VenueCanvas({
  layout,
  selectedId,
  onLayoutChange,
  onSelect,
  scale = 1,
}: VenueCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const updateComponent = useCallback(
    (id: string, updates: Partial<VenueComponent>) => {
      onLayoutChange({
        ...layout,
        components: layout.components.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
      });
    },
    [layout, onLayoutChange]
  );

  const [, dropRef] = useDrop({
    accept: [SIDEBAR_ITEM_TYPE, CANVAS_ITEM_TYPE],
    drop: (item: { type?: VenueComponentType; id?: string; component?: VenueComponent }, monitor) => {
      const offset = monitor.getSourceClientOffset();
      const rect = containerRef.current?.getBoundingClientRect();
      if (!offset || !rect) return;

      const x = (offset.x - rect.left) / scale;
      const y = (offset.y - rect.top) / scale;

      if (item.type && !item.id) {
        const def = DEFAULT_COMPONENTS[item.type];
        const newComp: VenueComponent = {
          id: generateId(),
          type: item.type,
          x: Math.max(0, x - def.width / 2),
          y: Math.max(0, y - def.height / 2),
          width: def.width,
          height: def.height,
          props: { ...def.props },
        };
        onLayoutChange({
          ...layout,
          components: [...layout.components, newComp],
        });
        onSelect(newComp.id);
      } else if (item.id && item.component) {
        const comp = layout.components.find((c) => c.id === item.id);
        if (comp) {
          updateComponent(item.id, {
            x: Math.max(0, x - comp.width / 2),
            y: Math.max(0, y - comp.height / 2),
          });
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const handleCanvasClick = useCallback(() => {
    onSelect(null);
  }, [onSelect]);

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      (dropRef as (el: HTMLDivElement | null) => void)(el);
      (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    },
    [dropRef]
  );

  return (
    <div
      ref={setRef}
      className="relative overflow-hidden rounded-xl border-2 border-dashed border-zinc-700/60 bg-zinc-900/80"
      style={{
        width: layout.canvasWidth * scale,
        height: layout.canvasHeight * scale,
      }}
      onClick={handleCanvasClick}
    >
      <div
        className="absolute inset-0"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: layout.canvasWidth,
          height: layout.canvasHeight,
        }}
      >
        {layout.components.map((comp) => (
          <CanvasComponent
            key={comp.id}
            component={comp}
            selected={selectedId === comp.id}
            onSelect={() => onSelect(comp.id)}
            onUpdate={(u) => updateComponent(comp.id, u)}
            onDelete={() => {
              onLayoutChange({
                ...layout,
                components: layout.components.filter((c) => c.id !== comp.id),
              });
              if (selectedId === comp.id) onSelect(null);
            }}
            scale={scale}
          />
        ))}
      </div>
    </div>
  );
}
