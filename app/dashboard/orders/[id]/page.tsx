"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type OrderDetail = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  date: string;
  totalCents: number;
  total: string;
  event: { id: string; name: string } | null;
};

type OrderItem = {
  seatNumber: string;
  location: string;
  ticketType: string;
  priceCents: number;
  price: string;
};

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/dashboard/orders/${id}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Failed to load");
        }
        const data = await res.json();
        setOrder(data.order);
        setItems(data.items ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-zinc-800" />
        <div className="h-64 rounded-xl border border-zinc-800 bg-zinc-900/30" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <Link
          href="/dashboard/orders"
          className="text-sm text-zinc-500 hover:text-zinc-300"
        >
          ← Orders
        </Link>
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error ?? "Order not found"}
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <div>
      <Link
        href="/dashboard/orders"
        className="text-sm text-zinc-500 hover:text-zinc-300"
      >
        ← Orders
      </Link>

      <div className="mt-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
            Order #{order.orderNumber}
          </h1>
          <p className="mt-1 text-zinc-400">
            {formatDate(order.date)}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6">
          <h2 className="mb-4 text-lg font-semibold text-zinc-50">
            Customer
          </h2>
          <dl className="space-y-2">
            <div>
              <dt className="text-xs text-zinc-500">Name</dt>
              <dd className="text-zinc-100">{order.customerName}</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Email</dt>
              <dd className="text-zinc-100">{order.customerEmail}</dd>
            </div>
            {order.event && (
              <div>
                <dt className="text-xs text-zinc-500">Event</dt>
                <dd>
                  <Link
                    href={`/events/${order.event.id}`}
                    className="text-amber-400 hover:text-amber-300"
                  >
                    {order.event.name}
                  </Link>
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/30">
          <div className="border-b border-zinc-800/60 px-6 py-4">
            <h2 className="text-lg font-semibold text-zinc-50">
              Items Purchased
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800/60 bg-zinc-800/30">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Seat / Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Ticket Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr
                    key={i}
                    className="border-b border-zinc-800/40"
                  >
                    <td className="px-6 py-4 text-zinc-100">
                      {item.location}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {item.ticketType}
                    </td>
                    <td className="px-6 py-4 text-right text-zinc-400">
                      ${item.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-zinc-800/60 px-6 py-4">
            <div className="flex justify-end">
              <span className="text-lg font-semibold text-zinc-50">
                Total: ${order.total}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
