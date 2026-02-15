"use client";

import { useRef } from "react";
import { useDrag } from "react-dnd";
import type { VenueComponentType } from "./types";

export const SIDEBAR_ITEM_TYPE = "SIDEBAR_COMPONENT";

type SidebarItemProps = {
  type: VenueComponentType;
  label: string;
  icon: React.ReactNode;
};

export function SidebarItem({ type, label, icon }: SidebarItemProps) {
  const [{ isDragging }, dragRef] = useDrag({
    type: SIDEBAR_ITEM_TYPE,
    item: { type },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  return (
    <div
      ref={dragRef as unknown as React.Ref<HTMLDivElement>}
      className={`flex cursor-grab items-center gap-3 rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-4 py-3 transition-colors hover:border-amber-500/40 hover:bg-zinc-800 ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="text-amber-500/80">{icon}</div>
      <span className="text-sm font-medium text-zinc-200">{label}</span>
    </div>
  );
}
