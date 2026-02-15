"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useDrag } from "react-dnd";
import type { VenueComponent } from "./types";

const CANVAS_ITEM_TYPE = "CANVAS_COMPONENT";

type CanvasComponentProps = {
  component: VenueComponent;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<VenueComponent>) => void;
  onDelete: () => void;
  scale: number;
};

export function CanvasComponent({
  component,
  selected,
  onSelect,
  onUpdate,
  onDelete,
  scale,
}: CanvasComponentProps) {
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  const [{ isDragging }, dragRef] = useDrag({
    type: CANVAS_ITEM_TYPE,
    item: { id: component.id, component },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsResizing(true);
      resizeStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        w: component.width,
        h: component.height,
      };
    },
    [component.width, component.height]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !resizeStartRef.current) return;
      const dx = (e.clientX - resizeStartRef.current.x) / scale;
      const dy = (e.clientY - resizeStartRef.current.y) / scale;
      const newWidth = Math.max(40, resizeStartRef.current.w + dx);
      const newHeight = Math.max(24, resizeStartRef.current.h + dy);
      onUpdate({ width: newWidth, height: newHeight });
    },
    [isResizing, onUpdate, scale]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    resizeStartRef.current = null;
  }, []);

  useEffect(() => {
    if (!isResizing) return;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const renderContent = () => {
    switch (component.type) {
      case "SECTION":
        return (
          <div className="flex h-full flex-col items-center justify-center border-2 border-dashed border-zinc-500/60 bg-indigo-500/20">
            <span className="text-xs font-medium text-zinc-300">
              {component.props.name ?? "Section"}
            </span>
            <span className="text-[10px] text-zinc-500">
              {component.props.rows ?? 10}×{component.props.cols ?? 10}
            </span>
          </div>
        );
      case "TABLE":
        return (
          <div className="flex h-full items-center justify-center rounded-full border-2 border-zinc-500/60 bg-emerald-500/20">
            <span className="text-xs font-medium text-zinc-300">
              {component.props.name ?? "Table"}
            </span>
          </div>
        );
      case "STAGE":
        return (
          <div className="flex h-full items-center justify-center rounded border-2 border-accent-500/60 bg-accent-500/20">
            <span className="text-sm font-medium text-zinc-300">
              {component.props.label ?? "Stage"}
            </span>
          </div>
        );
      case "TEXT":
        return (
          <div className="flex h-full items-center justify-center rounded border border-zinc-500/40 bg-zinc-700/40 px-2">
            <span className="truncate text-xs text-zinc-300">
              {component.props.text ?? "Label"}
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={dragRef as unknown as React.Ref<HTMLDivElement>}
      className={`absolute ${isDragging ? "opacity-50" : ""}`}
      style={{
        left: component.x,
        top: component.y,
        width: component.width,
        height: component.height,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div
        className={`relative h-full w-full ${
          selected ? "ring-2 ring-accent-500 ring-offset-1 ring-offset-zinc-900" : ""
        }`}
      >
        {renderContent()}
        {selected && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-400"
              aria-label="Remove"
            >
              ×
            </button>
            <div
              className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize resize-handle"
              onMouseDown={handleResizeStart}
              style={{ background: "rgba(251,191,36,0.5)" }}
            />
          </>
        )}
      </div>
    </div>
  );
}
