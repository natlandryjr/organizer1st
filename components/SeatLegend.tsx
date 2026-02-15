export function SeatLegend() {
  const items = [
    { color: "bg-zinc-500", label: "Available" },
    { color: "bg-blue-500", label: "Selected" },
    { color: "bg-red-700", label: "Booked" },
    { color: "bg-amber-600", label: "Held" },
  ];

  return (
    <div className="inline-flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-zinc-800/60 bg-zinc-900/30 px-4 py-2.5 text-xs text-zinc-400">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-2">
          <span className={`inline-block h-3 w-3 rounded-full ${item.color} ring-1 ring-white/10`} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
