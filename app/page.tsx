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
    <div className="space-y-10">
      {/* Hero section */}
      <section className="hero-gradient relative -mx-4 -mt-8 px-4 pb-10 pt-16 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="relative">
          <h1 className="animate-fade-in text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl">
            Upcoming <span className="text-gradient">Events</span>
          </h1>
          <p className="mt-3 animate-fade-in-up max-w-lg text-lg text-zinc-400 opacity-0 stagger-1">
            Explore our lineup and secure your seats for an unforgettable night of live jazz.
          </p>
        </div>
      </section>

      {events.length === 0 ? (
        <div className="animate-fade-in rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800/50">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-zinc-600">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          <p className="text-lg text-zinc-400">No events yet</p>
          <p className="mt-2 text-sm text-zinc-600">
            Check back soon for upcoming shows!
          </p>
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, i) => (
            <li
              key={event.id}
              className={`animate-fade-in-up opacity-0 stagger-${Math.min(i + 1, 5)}`}
            >
              <Link
                href={`/events/${event.id}`}
                className="card-lift group block overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/30 backdrop-blur-sm"
              >
                {event.flyerUrl ? (
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-800">
                    <img
                      src={event.flyerUrl}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/50 to-zinc-950/20" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        {event.name}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-zinc-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        {formatEventDate(event.date)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-zinc-800 via-zinc-850 to-zinc-900 flex items-center justify-center">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="text-zinc-700">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-lg font-semibold text-white">
                        {event.name}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-400">
                        {formatEventDate(event.date)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="p-5">
                  {event.description && (
                    <p className="line-clamp-2 text-sm leading-relaxed text-zinc-500">
                      {event.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="btn-glow inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-4 py-1.5 text-sm font-semibold text-amber-400 transition-colors group-hover:bg-amber-500/20">
                      Get Tickets
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                        <path d="m9 18 6-6-6-6"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatEventDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return (
    d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }) +
    " at " +
    d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })
  );
}
