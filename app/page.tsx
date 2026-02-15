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
    <div className="space-y-28 pb-16">
      {/* 1. Hero Section */}
      <section className="hero-gradient relative -mx-4 -mt-8 px-4 pb-20 pt-24 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 overflow-hidden">
        {/* Decorative blurred orbs */}
        <div className="pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-primary-500/10 blur-3xl animate-float" />
        <div className="pointer-events-none absolute -top-12 right-1/4 h-80 w-80 rounded-full bg-accent2-500/8 blur-3xl animate-float" style={{ animationDelay: "3s" }} />

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Pill badge */}
          <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5 text-sm font-medium text-primary-300">
            <span className="inline-block h-2 w-2 rounded-full bg-primary-400 glow-dot" />
            The organizer-first ticketing platform
          </div>

          <h1 className="animate-fade-in text-5xl font-bold tracking-tight text-zinc-50 sm:text-6xl lg:text-7xl">
            Stop Renting Your Revenue.{" "}
            <span className="text-gradient">Start Owning It.</span>
          </h1>
          <p className="mt-6 animate-fade-in-up max-w-2xl mx-auto text-lg text-zinc-400 opacity-0 stagger-1 sm:text-xl leading-relaxed">
            Organizer1st is the ticketing platform that puts you first. Get paid
            directly to your Stripe account with fair, transparent pricing. No
            holds. No delays. No excuses.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 opacity-0 animate-fade-in-up stagger-2 sm:flex-row">
            <Link
              href="/signup"
              className="btn-glow w-full rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 sm:w-auto"
            >
              Create Your First Event
            </Link>
            <Link
              href="/demo"
              className="btn-secondary w-full px-8 py-4 text-base font-semibold sm:w-auto"
            >
              See a Demo
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Social Proof Section */}
      <section className="animate-fade-in-up opacity-0 stagger-3">
        <div className="mx-auto max-w-3xl grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="stat-value text-3xl font-bold sm:text-4xl">500+</p>
            <p className="mt-1 text-sm text-zinc-500">Events Created</p>
          </div>
          <div>
            <p className="stat-value text-3xl font-bold sm:text-4xl">50K+</p>
            <p className="mt-1 text-sm text-zinc-500">Tickets Sold</p>
          </div>
          <div>
            <p className="stat-value text-3xl font-bold sm:text-4xl">99.5%</p>
            <p className="mt-1 text-sm text-zinc-500">Payout Rate</p>
          </div>
        </div>
        <p className="mt-6 text-center text-sm font-medium uppercase tracking-wider text-zinc-600">
          Trusted by independent organizers, festivals, and venues
        </p>
      </section>

      {/* 3. How It Works Section */}
      <section id="how-it-works" className="scroll-mt-24">
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-zinc-50">
          How It Works
        </h2>
        <p className="mb-12 text-center text-zinc-500">Three steps to full control of your revenue</p>
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            { icon: <StripeIcon />, title: "Connect Stripe", desc: "Connect your Stripe account in minutes. No lengthy approvals.", step: 1 },
            { icon: <CalendarIcon />, title: "Create Your Event", desc: "Use our powerful tools to set up your event and seating exactly how you want.", step: 2 },
            { icon: <WalletIcon />, title: "Get Paid Directly", desc: "Ticket revenue flows directly into your Stripe account. Your money, your control.", step: 3 },
          ].map((item) => (
            <div key={item.step} className="glass-card card-lift p-8 text-center">
              <div className="mx-auto mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white glow-dot">
                {item.step}
              </div>
              <div className="feature-icon mx-auto mb-4">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-zinc-50">Step {item.step}: {item.title}</h3>
              <p className="mt-2 text-zinc-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Features Section */}
      <section>
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-zinc-50">
          Everything You Need
        </h2>
        <p className="mb-12 text-center text-zinc-500">Powerful tools designed for organizers who mean business</p>
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
              className="glass-card card-lift p-6"
            >
              <div className="feature-icon mb-3">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-zinc-50">{feature.title}</h3>
              <p className="mt-1 text-sm text-zinc-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Pricing Section */}
      <section>
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-zinc-50">
          Simple, Transparent Pricing
        </h2>
        <p className="mb-12 text-center text-zinc-500">Keep more of what you earn</p>
        <div className="mx-auto max-w-3xl grid gap-6 sm:grid-cols-2">
          {/* Organizer1st card */}
          <div className="glass-card pricing-highlight gradient-border rounded-2xl p-8">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary-500/15 px-3 py-1 text-xs font-semibold text-primary-300">
              Recommended
            </div>
            <h3 className="text-xl font-bold text-zinc-50">Organizer1st</h3>
            <p className="mt-1 text-sm text-zinc-400">On a $50 ticket</p>
            <div className="mt-6">
              <span className="stat-value text-4xl font-bold">$49.50</span>
              <span className="ml-2 text-sm text-zinc-500">you keep</span>
            </div>
            <p className="mt-4 text-sm text-zinc-400">A simple flat fee per ticket. That&apos;s it.</p>
            <div className="mt-6 rounded-lg bg-warm-500/10 border border-warm-500/20 px-4 py-2.5">
              <p className="text-sm font-medium text-warm-400">
                Save $3.14 per ticket vs Eventbrite
              </p>
            </div>
          </div>
          {/* Eventbrite card */}
          <div className="glass-card rounded-2xl p-8 opacity-70">
            <div className="mb-2 h-6" />
            <h3 className="text-xl font-bold text-zinc-400">Eventbrite</h3>
            <p className="mt-1 text-sm text-zinc-500">On a $50 ticket</p>
            <div className="mt-6">
              <span className="text-4xl font-bold text-zinc-500">$46.36</span>
              <span className="ml-2 text-sm text-zinc-600">you keep</span>
            </div>
            <p className="mt-4 text-sm text-zinc-500">Service fee + payment processing + platform tax.</p>
            <div className="mt-6 rounded-lg bg-zinc-800/50 px-4 py-2.5">
              <p className="text-sm text-zinc-500">$3.64 in fees per ticket</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Final CTA Section */}
      <section className="mesh-gradient rounded-2xl border border-zinc-800/40 px-8 py-20 text-center sm:px-12">
        <h2 className="text-gradient text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to Take Back Control?
        </h2>
        <p className="mt-4 text-zinc-400">Join hundreds of organizers who keep more of their revenue.</p>
        <Link
          href="/signup"
          className="btn-glow mt-8 inline-block rounded-xl bg-gradient-to-r from-primary-500 to-accent2-600 px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-primary-500/20"
        >
          Sign Up for Free
        </Link>
      </section>

      {/* Upcoming Events (if any) */}
      {events.length > 0 && (
        <section>
          <div className="mb-6 glass-card px-6 py-4 border-primary-500/20">
            <p className="text-sm text-primary-200">
              <strong>Try it out:</strong> Book seats as an attendee, or{" "}
              <Link href="/login" className="underline hover:text-primary-100">
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
                  className="card-lift group block overflow-hidden rounded-2xl glass-card"
                >
                  {event.flyerUrl ? (
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-800">
                      <img
                        src={event.flyerUrl}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/50 to-zinc-950/20" />
                      {/* Date badge */}
                      <div className="absolute top-3 left-3 rounded-lg bg-zinc-950/70 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-zinc-200">
                        {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
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
                      <div className="absolute top-3 left-3 rounded-lg bg-zinc-950/70 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-zinc-200">
                        {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
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
                    <span className="btn-glow mt-4 inline-flex gap-1.5 rounded-full bg-gradient-to-r from-primary-500/15 to-accent2-500/10 px-4 py-1.5 text-sm font-semibold text-primary-400 transition-colors group-hover:from-primary-500/25 group-hover:to-accent2-500/15">
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
