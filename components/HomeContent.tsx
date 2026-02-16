"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { getTranslations } from "@/lib/translations";
import {
  StripeIcon,
  CalendarIcon,
  WalletIcon,
  SeatingIcon,
  PricingIcon,
  ChartIcon,
  UsersIcon,
  BrandIcon,
} from "./HomeIcons";

type Event = {
  id: string;
  name: string;
  date: Date;
  description: string;
  flyerUrl: string | null;
};

export function HomeContent({ events }: { events: Event[] }) {
  const { locale } = useLocale();
  const t = getTranslations(locale);

  return (
    <div className="space-y-28 pb-16">
      {/* 1. Hero Section */}
      <section className="hero-gradient relative -mx-4 -mt-8 px-4 pb-20 pt-24 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 overflow-hidden">
        <div className="pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-primary-500/10 blur-3xl animate-float" />
        <div className="pointer-events-none absolute -top-12 right-1/4 h-80 w-80 rounded-full bg-accent2-500/8 blur-3xl animate-float" style={{ animationDelay: "3s" }} />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5 text-sm font-medium text-primary-300">
            <span className="inline-block h-2 w-2 rounded-full bg-primary-400 glow-dot" />
            {t.badge}
          </div>

          <h1 className="animate-fade-in text-5xl font-bold tracking-tight text-zinc-50 sm:text-6xl lg:text-7xl">
            {t.headline}{" "}
            <span className="text-gradient">{t.headlineHighlight}</span>
          </h1>
          <p className="mt-6 animate-fade-in-up max-w-2xl mx-auto text-lg text-zinc-400 opacity-0 stagger-1 sm:text-xl leading-relaxed">
            {t.subhead}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 opacity-0 animate-fade-in-up stagger-2 sm:flex-row">
            <Link
              href="/signup"
              className="btn-glow w-full rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 sm:w-auto"
            >
              {t.ctaCreate}
            </Link>
            <Link
              href="/demo"
              className="btn-secondary w-full px-8 py-4 text-base font-semibold sm:w-auto"
            >
              {t.ctaDemo}
            </Link>
          </div>
        </div>
      </section>

      {/* 2. How It Works */}
      <section id="how-it-works" className="scroll-mt-24">
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-zinc-50">
          {t.howItWorks}
        </h2>
        <p className="mb-12 text-center text-zinc-500">{t.howItWorksSub}</p>
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            { icon: <StripeIcon />, title: t.step1Title, desc: t.step1Desc, step: 1 },
            { icon: <CalendarIcon />, title: t.step2Title, desc: t.step2Desc, step: 2 },
            { icon: <WalletIcon />, title: t.step3Title, desc: t.step3Desc, step: 3 },
          ].map((item) => (
            <div key={item.step} className="glass-card card-lift p-8 text-center">
              <div className="mx-auto mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white glow-dot">
                {item.step}
              </div>
              <div className="feature-icon mx-auto mb-4">{item.icon}</div>
              <h3 className="text-lg font-semibold text-zinc-50">
                Step {item.step}: {item.title}
              </h3>
              <p className="mt-2 text-zinc-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Features */}
      <section>
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-zinc-50">
          {t.featuresTitle}
        </h2>
        <p className="mb-12 text-center text-zinc-500">{t.featuresSub}</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: <WalletIcon />, title: t.feature1Title, desc: t.feature1Desc },
            { icon: <SeatingIcon />, title: t.feature2Title, desc: t.feature2Desc },
            { icon: <PricingIcon />, title: t.feature3Title, desc: t.feature3Desc },
            { icon: <ChartIcon />, title: t.feature4Title, desc: t.feature4Desc },
            { icon: <UsersIcon />, title: t.feature5Title, desc: t.feature5Desc },
            { icon: <BrandIcon />, title: t.feature6Title, desc: t.feature6Desc },
          ].map((feature, i) => (
            <div key={i} className="glass-card card-lift p-6">
              <div className="feature-icon mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-zinc-50">{feature.title}</h3>
              <p className="mt-1 text-sm text-zinc-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Pricing */}
      <section>
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-zinc-50">
          {t.pricingTitle}
        </h2>
        <p className="mb-12 text-center text-zinc-500">{t.pricingSub}</p>
        <div className="mx-auto max-w-3xl grid gap-6 sm:grid-cols-2">
          <div className="glass-card pricing-highlight gradient-border rounded-2xl p-8">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary-500/15 px-3 py-1 text-xs font-semibold text-primary-300">
              {t.recommended}
            </div>
            <h3 className="text-xl font-bold text-zinc-50">Organizer1st</h3>
            <p className="mt-1 text-sm text-zinc-400">{t.o1OnTicket}</p>
            <div className="mt-6">
              <span className="stat-value text-4xl font-bold">$49.50</span>
              <span className="ml-2 text-sm text-zinc-500">{t.o1YouKeep}</span>
            </div>
            <p className="mt-4 text-sm text-zinc-400">{t.o1Simple}</p>
            <div className="mt-6 rounded-lg bg-warm-500/10 border border-warm-500/20 px-4 py-2.5">
              <p className="text-sm font-medium text-warm-400">{t.o1SaveVs}</p>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-8 opacity-70">
            <div className="mb-2 h-6" />
            <h3 className="text-xl font-bold text-zinc-400">Eventbrite</h3>
            <p className="mt-1 text-sm text-zinc-500">{t.o1OnTicket}</p>
            <div className="mt-6">
              <span className="text-4xl font-bold text-zinc-500">$46.36</span>
              <span className="ml-2 text-sm text-zinc-600">{t.ebYouKeep}</span>
            </div>
            <p className="mt-4 text-sm text-zinc-500">{t.ebFees}</p>
            <div className="mt-6 rounded-lg bg-zinc-800/50 px-4 py-2.5">
              <p className="text-sm text-zinc-500">$3.64 in fees per ticket</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Final CTA */}
      <section className="mesh-gradient rounded-2xl border border-zinc-800/40 px-8 py-20 text-center sm:px-12">
        <h2 className="text-gradient text-3xl font-bold tracking-tight sm:text-4xl">
          {t.ctaFinalTitle}
        </h2>
        <p className="mt-4 text-zinc-400">{t.ctaFinalSub}</p>
        <Link
          href="/signup"
          className="btn-glow mt-8 inline-block rounded-xl bg-gradient-to-r from-primary-500 to-accent2-600 px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-primary-500/20"
        >
          {t.ctaSignUp}
        </Link>
      </section>

      {/* Upcoming Events */}
      {events.length > 0 && (
        <section>
          <div className="mb-6 glass-card px-6 py-4 border-primary-500/20">
            <p className="text-sm text-primary-200">
              <strong>{t.tryItOut}</strong>{" "}
              <Link href="/login" className="underline hover:text-primary-100">
                {t.logInDemo}
              </Link>{" "}
              (demo@organizer1st.com / Demo1234!) to edit events, manage attendees, and explore the dashboard.
            </p>
          </div>
          <h2 className="mb-8 text-3xl font-bold tracking-tight text-zinc-50">
            {t.upcomingEvents}
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
                      <div className="absolute top-3 left-3 rounded-lg bg-zinc-950/70 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-zinc-200">
                        {new Date(event.date).toLocaleDateString(locale === "zh" ? "zh-CN" : locale, {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="text-xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                          {event.name}
                        </h3>
                        <p className="mt-1 text-sm font-medium text-zinc-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                          {formatEventDate(event.date, locale)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900">
                      <CalendarIcon className="h-12 w-12 text-zinc-600" />
                      <div className="absolute top-3 left-3 rounded-lg bg-zinc-950/70 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-zinc-200">
                        {new Date(event.date).toLocaleDateString(locale === "zh" ? "zh-CN" : locale, {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="text-lg font-semibold text-white">{event.name}</h3>
                        <p className="mt-1 text-sm text-zinc-400">
                          {formatEventDate(event.date, locale)}
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
                      {t.getTickets}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-transform group-hover:translate-x-0.5"
                      >
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

function formatEventDate(date: Date | string, locale: string): string {
  const d = date instanceof Date ? date : new Date(date);
  const loc = locale === "zh" ? "zh-CN" : locale;
  return (
    d.toLocaleDateString(loc, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }) +
    " at " +
    d.toLocaleTimeString(loc, {
      hour: "numeric",
      minute: "2-digit",
    })
  );
}
