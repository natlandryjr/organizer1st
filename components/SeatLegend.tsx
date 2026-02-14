export function SeatLegend() {
  const items = [
    { color: "bg-zinc-500", label: "Available" },
    { color: "bg-blue-500", label: "Selected" },
    { color: "bg-red-700", label: "Booked" },
    { color: "bg-amber-600", label: "Held" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span className={`inline-block h-3 w-3 rounded-full ${item.color}`} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
