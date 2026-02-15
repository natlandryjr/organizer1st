"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { downloadCsv } from "@/lib/csv";

type Order = {
  id: string;
  orderId: string;
  customerName: string;
  amountCents: number;
  amount: string;
  date: string;
  eventId: string | null;
  eventName: string | null;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard/orders");
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Failed to load");
        }
        const data = await res.json();
        setOrders(data.orders ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orders");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function exportAllOrders() {
    const data = orders.map((o) => ({
      "Order ID": `#${o.orderId}`,
      "Customer Name": o.customerName,
      Amount: `$${o.amount}`,
      Date: formatDate(o.date),
      Event: o.eventName ?? "",
    }));
    downloadCsv(data, `orders-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-zinc-800" />
        <div className="h-64 rounded-xl border border-zinc-800 bg-zinc-900/30" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
            Orders
          </h1>
          <p className="mt-2 text-zinc-400">
            View and manage all orders across your events.
          </p>
        </div>
        <button
          type="button"
          onClick={exportAllOrders}
          disabled={orders.length === 0}
          className="shrink-0 rounded-xl border border-zinc-600 px-4 py-2.5 font-medium text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-50"
        >
          Export All Orders
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="mt-8 overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/30">
        {orders.length === 0 ? (
          <div className="px-8 py-16 text-center">
            <p className="text-zinc-400">No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-zinc-800/60 bg-zinc-800/30">
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-zinc-800/40 transition-colors hover:bg-zinc-800/20"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="font-mono font-medium text-amber-400 hover:text-amber-300"
                      >
                        #{order.orderId}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-zinc-50">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      ${order.amount}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {formatDate(order.date)}
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
