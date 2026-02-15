"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { downloadCsv } from "@/lib/csv";

type Metrics = {
  totalRevenueCents: number;
  totalRevenue: string;
  ticketsSold: number;
  numberOfEvents: number;
  averageTicketPriceCents: number;
  averageTicketPrice: string;
};

type RevenuePoint = {
  date: string;
  revenue: number;
  revenueFormatted: string;
};

type TicketsByEvent = {
  eventId: string;
  eventName: string;
  ticketsSold: number;
};

type TopEvent = {
  eventId: string;
  eventName: string;
  totalSalesCents: number;
  totalSales: string;
  ticketsSold: number;
};

type AnalyticsData = {
  metrics: Metrics;
  revenueOverTime: RevenuePoint[];
  ticketsByEvent: TicketsByEvent[];
  topEvents: TopEvent[];
};

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard/analytics");
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? "Failed to load");
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 rounded bg-zinc-800" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-zinc-800/40" />
          ))}
        </div>
        <div className="h-80 rounded-xl bg-zinc-800/20" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
          Analytics
        </h1>
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error ?? "Failed to load analytics"}
        </div>
      </div>
    );
  }

  const { metrics, revenueOverTime, ticketsByEvent, topEvents } = data;

  async function handleExportSalesReport() {
    setExporting(true);
    try {
      const res = await fetch("/api/dashboard/analytics/sales-report");
      if (!res.ok) throw new Error("Failed to fetch");
      const { sales } = await res.json();
      downloadCsv(sales ?? [], `sales-report-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch {
      setError("Failed to export sales report");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
            Analytics
          </h1>
          <p className="mt-2 text-zinc-400">
            Key metrics and performance insights for your organization.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportSalesReport}
          disabled={exporting}
          className="shrink-0 rounded-xl border border-zinc-600 px-4 py-2.5 font-medium text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-50"
        >
          {exporting ? "Exporting..." : "Export Full Sales Report"}
        </button>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6">
          <p className="text-sm font-medium text-zinc-500">Total Revenue</p>
          <p className="mt-2 text-2xl font-bold text-zinc-50">
            ${metrics.totalRevenue}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6">
          <p className="text-sm font-medium text-zinc-500">Tickets Sold</p>
          <p className="mt-2 text-2xl font-bold text-zinc-50">
            {metrics.ticketsSold}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6">
          <p className="text-sm font-medium text-zinc-500">Number of Events</p>
          <p className="mt-2 text-2xl font-bold text-zinc-50">
            {metrics.numberOfEvents}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6">
          <p className="text-sm font-medium text-zinc-500">Average Ticket Price</p>
          <p className="mt-2 text-2xl font-bold text-zinc-50">
            ${metrics.averageTicketPrice}
          </p>
        </div>
      </div>

      {/* Revenue Over Time */}
      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-50">
          Revenue Over Time
        </h2>
        <p className="mb-4 text-sm text-zinc-500">
          Daily sales for the last 30 days
        </p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                stroke="#71717a"
                fontSize={12}
              />
              <YAxis
                tickFormatter={(v) => `$${v}`}
                stroke="#71717a"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                }}
                labelFormatter={(label) => formatShortDate(String(label))}
                formatter={(value: number | undefined) => [`$${(value ?? 0).toFixed(2)}`, "Revenue"]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: "#f59e0b", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tickets Sold by Event */}
      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-50">
          Tickets Sold by Event
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={ticketsByEvent}
              layout="vertical"
              margin={{ left: 20, right: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis type="number" stroke="#71717a" fontSize={12} />
              <YAxis
                type="category"
                dataKey="eventName"
                width={120}
                stroke="#71717a"
                fontSize={11}
                tick={{ fill: "#a1a1aa" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                }}
                formatter={(value: number | undefined) => [value ?? 0, "Tickets"]}
              />
              <Bar dataKey="ticketsSold" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 5 Events Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/30">
        <div className="border-b border-zinc-800/60 px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-50">
            Top 5 Performing Events
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Events ranked by total sales
          </p>
        </div>
        {topEvents.length === 0 ? (
          <div className="px-6 py-12 text-center text-zinc-500">
            No sales data yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800/60 bg-zinc-800/30">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Tickets Sold
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Total Sales
                  </th>
                </tr>
              </thead>
              <tbody>
                {topEvents.map((event, i) => (
                  <tr
                    key={event.eventId}
                    className="border-b border-zinc-800/40 transition-colors hover:bg-zinc-800/20"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-zinc-50">
                        {i + 1}. {event.eventName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {event.ticketsSold}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-zinc-50">
                      ${event.totalSales}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
