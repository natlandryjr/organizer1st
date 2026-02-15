"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Organization = {
  id: string;
  name: string;
};

type Event = {
  id: string;
  name: string;
  date: string;
  location: string | null;
  status: string;
};

type Venue = {
  id: string;
  name: string;
};

type Order = {
  id: string;
  orderId: string;
  customerName: string;
  amount: string;
  date: string;
  eventName: string | null;
};

export default function OrganizerViewPage() {
  const params = useParams();
  const orgId = params.orgId as string;

  const [org, setOrg] = useState<Organization | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    Promise.all([
      fetch(`/api/admin5550/organizations/${orgId}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/admin5550/events?organizationId=${orgId}`).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/admin5550/venues?organizationId=${orgId}`).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/admin5550/orders?organizationId=${orgId}`).then((r) =>
        r.ok ? r.json().then((d: { orders?: Order[] }) => d.orders ?? []) : []
      ),
    ])
      .then(([orgData, eventsData, venuesData, ordersData]) => {
        setOrg(orgData);
        setEvents(eventsData);
        setVenues(venuesData);
        setOrders(ordersData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orgId]);

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 rounded bg-zinc-800" />
        <div className="h-40 rounded-xl bg-zinc-800/40" />
        <div className="h-40 rounded-xl bg-zinc-800/40" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
        Organization not found
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin5550/organizations"
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            ← Back to Organizations
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-zinc-50">
            Organizer view: {org.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Viewing this organization as an organizer would see it
          </p>
        </div>
      </div>

      {/* Events */}
      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 overflow-hidden">
        <h2 className="border-b border-zinc-800/60 bg-zinc-800/30 px-6 py-4 text-lg font-semibold text-zinc-50">
          Events
        </h2>
        {events.length === 0 ? (
          <div className="px-6 py-12 text-center text-zinc-500">No events</div>
        ) : (
          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-zinc-800/60">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400 sm:px-6">
                    Event
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400 sm:px-6">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400 sm:px-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr
                    key={ev.id}
                    className="border-b border-zinc-800/40 hover:bg-zinc-800/20"
                  >
                    <td className="px-4 py-3 sm:px-6">
                      <span className="font-medium text-zinc-50">{ev.name}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400 sm:px-6">
                      {formatDate(ev.date)}
                    </td>
                    <td className="px-4 py-3 text-right sm:px-6">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/events/${ev.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded bg-accent-500/20 px-3 py-1 text-sm font-medium text-accent-400 hover:bg-accent-500/30"
                        >
                          Attendee view
                        </Link>
                        <Link
                          href={`/admin5550/edit/${ev.id}`}
                          className="rounded bg-zinc-700 px-3 py-1 text-sm text-zinc-300 hover:bg-zinc-600"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Venues */}
      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 overflow-hidden">
        <h2 className="border-b border-zinc-800/60 bg-zinc-800/30 px-6 py-4 text-lg font-semibold text-zinc-50">
          Venues
        </h2>
        {venues.length === 0 ? (
          <div className="px-6 py-12 text-center text-zinc-500">No venues</div>
        ) : (
          <ul className="divide-y divide-zinc-800/60">
            {venues.map((v) => (
              <li
                key={v.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-zinc-800/20"
              >
                <span className="font-medium text-zinc-50">{v.name}</span>
                <Link
                  href={`/admin5550/venues?organizationId=${orgId}`}
                  className="rounded bg-zinc-700 px-3 py-1 text-sm text-zinc-300 hover:bg-zinc-600"
                >
                  Manage
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Orders */}
      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 overflow-hidden">
        <h2 className="border-b border-zinc-800/60 bg-zinc-800/30 px-6 py-4 text-lg font-semibold text-zinc-50">
          Orders
        </h2>
        {orders.length === 0 ? (
          <div className="px-6 py-12 text-center text-zinc-500">No orders</div>
        ) : (
          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-zinc-800/60">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400 sm:px-6">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400 sm:px-6">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400 sm:px-6">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400 sm:px-6">
                    Event
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400 sm:px-6">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-zinc-800/40 hover:bg-zinc-800/20"
                  >
                    <td className="px-4 py-3 font-mono text-sm text-accent-400 sm:px-6">
                      #{o.orderId}
                    </td>
                    <td className="px-4 py-3 text-zinc-50 sm:px-6">
                      {o.customerName}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 sm:px-6">
                      ${o.amount}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400 sm:px-6">
                      {o.eventName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400 sm:px-6">
                      {formatDate(o.date)}
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
