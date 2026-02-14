import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
    select: {
      id: true,
      name: true,
      date: true,
      description: true,
      flyerUrl: true,
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-50">
          Upcoming Events
        </h2>
        <p className="mt-1 text-zinc-400">
          Select an event to view the seating chart and purchase tickets.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <p className="text-zinc-400">No events yet.</p>
          <p className="mt-2 text-sm text-zinc-500">
            Check back soon for upcoming events!
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <li key={event.id}>
              <Link
                href={`/events/${event.id}`}
                className="block overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 transition-colors hover:border-zinc-700 hover:bg-zinc-900"
              >
                {event.flyerUrl && (
                  <div className="aspect-video w-full overflow-hidden bg-zinc-800">
                    <img
                      src={event.flyerUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                <h3 className="font-medium text-zinc-50">{event.name}</h3>
                <p className="mt-1 text-sm text-zinc-400">
                  {(event.date instanceof Date
                    ? event.date
                    : new Date(event.date)
                  ).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {" at "}
                  {(event.date instanceof Date
                    ? event.date
                    : new Date(event.date)
                  ).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-zinc-500">
                  {event.description}
                </p>
                <span className="mt-3 inline-block rounded-full bg-amber-500/15 px-3 py-1 text-sm font-semibold text-amber-400">
                  Get Tickets
                </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
