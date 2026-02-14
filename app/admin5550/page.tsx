"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDesigner } from "@/components/LayoutDesigner";

type SectionConfig = {
  name: string;
  rows: number;
  cols: number;
  posX: number;
  posY: number;
  color: string;
};

type TableConfig = {
  name: string;
  seatCount: number;
  posX: number;
  posY: number;
  color: string;
};

const COLOR_PALETTE = [
  "#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#ec4899", "#84cc16", "#64748b", "#f97316",
];

type StageConfig = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export default function AdminPage() {
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [maxSeats, setMaxSeats] = useState<string>("");
  const [flyerUrl, setFlyerUrl] = useState("");
  const [mapName, setMapName] = useState("");
  const [gridCols, setGridCols] = useState(24);
  const [gridRows, setGridRows] = useState(48);
  const [stage, setStage] = useState<StageConfig>({ x: 0, y: 0, width: 20, height: 20 });
  const SECTION_ZONE_START = 28; // stage (20) + table zone (8)
  const TABLE_ZONE_START = 20;
  const [sections, setSections] = useState<SectionConfig[]>([
    { name: "General Admission", rows: 5, cols: 10, posX: 0, posY: SECTION_ZONE_START, color: "#6366f1" },
  ]);
  const [tables, setTables] = useState<TableConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  function addSection() {
    setSections((s) => [...s, { name: "", rows: 5, cols: 10, posX: 0, posY: SECTION_ZONE_START, color: COLOR_PALETTE[s.length % COLOR_PALETTE.length] }]);
  }

  function removeSection(i: number) {
    setSections((s) => s.filter((_, j) => j !== i));
  }

  function updateSection(i: number, field: keyof SectionConfig, value: string | number) {
    setSections((s) =>
      s.map((sec, j) => (j === i ? { ...sec, [field]: value } : sec))
    );
  }

  function addTable() {
    setTables((t) => [...t, { name: "", seatCount: 4, posX: 2 + t.length * 2, posY: TABLE_ZONE_START, color: COLOR_PALETTE[t.length % COLOR_PALETTE.length] }]);
  }

  function removeTable(i: number) {
    setTables((t) => t.filter((_, j) => j !== i));
  }

  function updateTable(i: number, field: keyof TableConfig, value: string | number) {
    setTables((t) =>
      t.map((tab, j) => (j === i ? { ...tab, [field]: value } : tab))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName,
          eventDate: new Date(eventDate).toISOString(),
          eventDescription,
          maxSeats: maxSeats ? parseInt(maxSeats, 10) : null,
          flyerUrl: flyerUrl.trim() || null,
          seatingConfig: {
            mapName,
            gridCols,
            gridRows,
            stage: {
              x: 0,
              y: 0,
              width: stage.width || 20,
              height: stage.height || 20,
            },
            sections: sections.map(({ name, rows, cols, posX, posY, color }) => ({
              name,
              rows,
              cols,
              posX,
              posY,
              color: color || null,
            })),
            tables: tables.map(({ name, seatCount, posX, posY, color }) => ({
              name,
              seatCount,
              posX,
              posY,
              color: color || null,
            })),
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create event");
      }

      setMessage({
        type: "success",
        text: `Event "${data.event.name}" created. View it at /events/${data.event.id}`,
      });
      setEventName("");
      setEventDate("");
      setEventDescription("");
      setMaxSeats("");
      setFlyerUrl("");
      setMapName("");
      setStage({ x: 0, y: 0, width: 20, height: 20 });
      setSections([{ name: "General Admission", rows: 5, cols: 10, posX: 0, posY: SECTION_ZONE_START, color: "#6366f1" }]);
      setTables([]);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-zinc-50">Event Management</h2>
        <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-300">
          ← Back to events
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <h3 className="text-lg font-medium text-zinc-300">Event details</h3>
          <div>
            <label className="mb-1 block text-sm text-zinc-400">Event name</label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              required
              className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="Jazz Night"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-400">Date & time</label>
            <input
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-400">Description</label>
            <textarea
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              required
              rows={3}
              className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="An evening of live jazz..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-400">Max seating (optional)</label>
            <input
              type="number"
              min={1}
              value={maxSeats}
              onChange={(e) => setMaxSeats(e.target.value)}
              className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="Leave empty for no limit"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Maximum number of tickets to sell. Prevents overselling when set.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-400">Event flyer image URL (optional)</label>
            <input
              type="url"
              value={flyerUrl}
              onChange={(e) => setFlyerUrl(e.target.value)}
              className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="https://example.com/flyer.jpg"
            />
            <p className="mt-1 text-xs text-zinc-500">
              URL to event poster or flyer image. Host on Imgur, Cloudinary, or your site.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <h3 className="text-lg font-medium text-zinc-300">Seating map</h3>
          <div>
            <label className="mb-1 block text-sm text-zinc-400">Map name</label>
            <input
              type="text"
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              required
              className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="Main Hall"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-zinc-400">Grid columns</label>
              <input
                type="number"
                min={8}
                max={48}
                value={gridCols}
                onChange={(e) => setGridCols(Math.max(8, parseInt(e.target.value) || 24))}
                className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-400">Grid rows</label>
              <input
                type="number"
                min={8}
                max={48}
                value={gridRows}
                onChange={(e) => setGridRows(Math.max(8, parseInt(e.target.value) || 24))}
                className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100"
              />
            </div>
          </div>

          <div className="rounded-lg border border-zinc-700 bg-zinc-900/30 p-4">
            <h4 className="mb-3 text-sm font-medium text-zinc-400">Stage</h4>
            <p className="mb-3 text-xs text-zinc-500">
              Stage is fixed at the top. Default 20×20 (grid units).
            </p>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="mb-0.5 block text-xs text-zinc-500">Width</label>
                <input
                  type="number"
                  min={1}
                  value={stage.width}
                  onChange={(e) => setStage((s) => ({ ...s, width: parseInt(e.target.value) || 20 }))}
                  className="w-14 rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-sm text-zinc-100"
                />
              </div>
              <div>
                <label className="mb-0.5 block text-xs text-zinc-500">Height</label>
                <input
                  type="number"
                  min={1}
                  value={stage.height}
                  onChange={(e) => setStage((s) => ({ ...s, height: parseInt(e.target.value) || 20 }))}
                  className="w-14 rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-sm text-zinc-100"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-400">Sections</span>
              <button
                type="button"
                onClick={addSection}
                className="text-sm text-amber-500 hover:text-amber-400"
              >
                + Add section
              </button>
            </div>
            <div className="space-y-3">
              {sections.map((sec, i) => (
                <div
                  key={i}
                  className="flex flex-wrap items-center gap-3 rounded border border-zinc-700 bg-zinc-800/50 p-3"
                >
                  <input
                    type="text"
                    value={sec.name}
                    onChange={(e) => updateSection(i, "name", e.target.value)}
                    placeholder="Section name"
                    className="flex-1 min-w-[100px] rounded border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-100 placeholder-zinc-500"
                  />
                  <input
                    type="number"
                    min={1}
                    value={sec.rows}
                    onChange={(e) => updateSection(i, "rows", parseInt(e.target.value) || 1)}
                    className="w-12 rounded border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-100"
                  />
                  <span className="text-zinc-500 text-xs">×</span>
                  <input
                    type="number"
                    min={1}
                    value={sec.cols}
                    onChange={(e) => updateSection(i, "cols", parseInt(e.target.value) || 1)}
                    className="w-12 rounded border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-100"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-zinc-500">Color</span>
                    <div className="flex gap-1">
                      {COLOR_PALETTE.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => updateSection(i, "color", c)}
                          className={`h-6 w-6 rounded border-2 transition-all ${
                            sec.color === c ? "border-zinc-100 scale-110" : "border-transparent hover:border-zinc-500"
                          }`}
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSection(i)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-400">Tables</span>
              <button
                type="button"
                onClick={addTable}
                className="text-sm text-amber-500 hover:text-amber-400"
              >
                + Add table
              </button>
            </div>
            <div className="space-y-3">
              {tables.map((tab, i) => (
                <div
                  key={i}
                  className="flex flex-wrap items-center gap-3 rounded border border-zinc-700 bg-zinc-800/50 p-3"
                >
                  <input
                    type="text"
                    value={tab.name}
                    onChange={(e) => updateTable(i, "name", e.target.value)}
                    placeholder="Table name"
                    className="flex-1 min-w-[100px] rounded border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-100 placeholder-zinc-500"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={2}
                      max={16}
                      value={tab.seatCount}
                      onChange={(e) => updateTable(i, "seatCount", Math.max(2, Math.min(16, parseInt(e.target.value) || 4)))}
                      className="w-14 rounded border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-100"
                    />
                    <span className="text-xs text-zinc-500">seats</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-zinc-500">Color</span>
                    <div className="flex gap-1">
                      {COLOR_PALETTE.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => updateTable(i, "color", c)}
                          className={`h-6 w-6 rounded border-2 transition-all ${
                            tab.color === c ? "border-zinc-100 scale-110" : "border-transparent hover:border-zinc-500"
                          }`}
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTable(i)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-medium text-zinc-400">Layout designer</h4>
            <LayoutDesigner
              gridCols={gridCols}
              gridRows={gridRows}
              stage={stage}
              sections={sections}
              tables={tables}
              onStageChange={setStage}
              onSectionChange={(i, posX, posY) => {
                updateSection(i, "posX", posX);
                updateSection(i, "posY", posY);
              }}
              onTableChange={(i, posX, posY) => {
                updateTable(i, "posX", posX);
                updateTable(i, "posY", posY);
              }}
            />
          </div>
        </div>

        {message && (
          <div
            className={`rounded-lg p-4 ${
              message.type === "success"
                ? "bg-green-900/30 text-green-300 border border-green-800"
                : "bg-red-900/30 text-red-300 border border-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-amber-500 px-6 py-2.5 font-semibold text-zinc-950 transition-colors hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Create event"}
        </button>
      </form>
    </div>
  );
}
