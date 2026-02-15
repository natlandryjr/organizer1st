import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  let events: { id: string; name: string; date: Date; description: string; flyerUrl: string | null }[] = [];
  try {
    events = await prisma.event.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { date: "asc" },
      select: {
        id: true,
        name: true,
        date: true,
        description: true,
        flyerUrl: true,
      },
    });
  } catch (err) {
    console.error("Home page events fetch:", err);
  }

  return (
    <div className="space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="hero-gradient relative -mx-4 -mt-8 px-4 pb-16 pt-20 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="animate-fade-in text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl">
            Stop Renting Your Revenue.{" "}
            <span className="text-gradient">Start Owning It.</span>
          </h1>
          <p className="mt-6 animate-fade-in-up max-w-2xl mx-auto text-lg text-zinc-400 opacity-0 stagger-1 sm:text-xl">
            Organizer1st is the ticketing platform that puts you first. Get paid
            directly to your Stripe account with fair, transparent pricing. No
            holds. No delays. No excuses.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 opacity-0 animate-fade-in-up stagger-2 sm:flex-row">
            <Link
              href="/signup"
              className="btn-glow w-full rounded-xl bg-accent-500 px-8 py-4 text-base font-semibold text-zinc-950 transition-colors hover:bg-accent-400 sm:w-auto"
            >
              Create Your First Event
            </Link>
            <Link
              href="/demo"
              className="w-full rounded-xl border border-zinc-600 px-8 py-4 text-base font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-800/50 sm:w-auto"
            >
              See a Demo
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Social Proof Section */}
      <section className="text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
          Trusted by independent organizers, festivals, and venues.
        </p>
      </section>

      {/* 3. How It Works Section */}
      <section id="how-it-works" className="scroll-mt-24">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-zinc-50">
          How It Works
        </h2>
        <div className="grid gap-10 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/20 text-primary-400">
              <StripeIcon />
            </div>
            <h3 className="text-lg font-semibold text-zinc-50">Step 1: Connect Stripe</h3>
            <p className="mt-2 text-zinc-400">
              Connect your Stripe account in minutes. No lengthy approvals.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/20 text-primary-400">
              <CalendarIcon />
            </div>
            <h3 className="text-lg font-semibold text-zinc-50">Step 2: Create Your Event</h3>
            <p className="mt-2 text-zinc-400">
              Use our powerful tools to set up your event and seating exactly how
              you want.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/20 text-primary-400">
              <WalletIcon />
            </div>
            <h3 className="text-lg font-semibold text-zinc-50">Step 3: Get Paid Directly</h3>
            <p className="mt-2 text-zinc-400">
              Ticket revenue flows directly into your Stripe account. Your money,
              your control.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section>
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-zinc-50">
          Everything You Need
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: <WalletIcon />,
              title: "Direct Stripe Payouts",
              desc: "Money goes straight to your Stripe account. No holds, no delays.",
            },
            {
              icon: <SeatingIcon />,
              title: "Custom Seating Charts",
              desc: "Design sections, tables, and floor plans that match your venue.",
            },
            {
              icon: <PricingIcon />,
              title: "Fair Flat-Fee Pricing",
              desc: "One simple fee per ticket. No hidden percentages or surprise charges.",
            },
            {
              icon: <ChartIcon />,
              title: "Real-time Analytics",
              desc: "Track sales, capacity, and bookings as they happen.",
            },
            {
              icon: <UsersIcon />,
              title: "Attendee Management",
              desc: "Manage holds, bookings, and guest lists in one place.",
            },
            {
              icon: <BrandIcon />,
              title: "Branded Event Pages",
              desc: "Beautiful, professional pages that reflect your brand.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="card-lift rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-500/20 text-accent-400">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-zinc-50">{feature.title}</h3>
              <p className="mt-1 text-sm text-zinc-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Pricing Section */}
      <section className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-8 sm:p-12">
        <h2 className="mb-8 text-center text-3xl font-bold tracking-tight text-zinc-50">
          Simple, Transparent Pricing
        </h2>
        <div className="mx-auto max-w-2xl overflow-x-auto rounded-xl border border-zinc-700/60">
          <table className="w-full min-w-[320px] text-left">
            <thead>
              <tr className="border-b border-zinc-700/60 bg-zinc-800/40">
                <th className="px-6 py-4 font-semibold text-zinc-50">$50 Ticket</th>
                <th className="px-6 py-4 font-semibold text-primary-400">Organizer1st</th>
                <th className="px-6 py-4 font-semibold text-zinc-400">Eventbrite</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-700/40">
                <td className="px-6 py-4 text-zinc-400">You keep</td>
                <td className="px-6 py-4 font-semibold text-primary-400">$49.50</td>
                <td className="px-6 py-4 text-zinc-500">$46.36</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-center text-zinc-400">
          A simple flat fee per ticket. That&apos;s it.
        </p>
      </section>

      {/* 6. Final CTA Section */}
      <section className="hero-gradient rounded-2xl border border-zinc-800/60 bg-zinc-900/20 px-8 py-16 text-center sm:px-12">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
          Ready to Take Back Control?
        </h2>
        <Link
          href="/signup"
          className="btn-glow mt-8 inline-block rounded-xl bg-accent-500 px-10 py-4 text-lg font-semibold text-zinc-950 transition-colors hover:bg-accent-400"
        >
          Sign Up for Free
        </Link>
      </section>

      {/* Upcoming Events (if any) */}
      {events.length > 0 && (
        <section>
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-4">
            <p className="text-sm text-amber-200">
              <strong>Try it out:</strong> Book seats as an attendee, or{" "}
              <Link href="/login" className="underline hover:text-amber-100">
                log in as the demo organizer
              </Link>{" "}
              (demo@organizer1st.com / Demo1234!) to edit events, manage attendees, and explore the dashboard.
            </p>
          </div>
          <h2 className="mb-8 text-3xl font-bold tracking-tight text-zinc-50">
            Upcoming Events
          </h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <li key={event.id}>
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
                    <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900">
                      <CalendarIcon className="h-12 w-12 text-zinc-600" />
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
                    <span className="btn-glow mt-4 inline-flex gap-1.5 rounded-full bg-accent-500/10 px-4 py-1.5 text-sm font-semibold text-accent-400 transition-colors group-hover:bg-accent-500/20">
                      Get Tickets
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
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

function StripeIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.549-2.354 1.549-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.571-7.257z" />
    </svg>
  );
}

function CalendarIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function WalletIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function SeatingIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  );
}

function PricingIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ChartIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function UsersIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function BrandIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  );
}
