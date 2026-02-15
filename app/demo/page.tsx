import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SAMPLE_ORG_NAME = "Sample Organizer";
const SAMPLE_EVENT_NAME = "Sample Event";

export default async function DemoPage() {
  let org: { id: string; name: string } | null = null;
  let sampleEvent: { id: string; name: string; date: Date } | null = null;

  try {
    org = await prisma.organization.findFirst({
      where: { name: SAMPLE_ORG_NAME },
      select: { id: true, name: true },
    });
    if (org) {
      const event = await prisma.event.findFirst({
        where: {
          organizationId: org.id,
          name: SAMPLE_EVENT_NAME,
          status: "PUBLISHED",
        },
        select: { id: true, name: true, date: true },
      });
      sampleEvent = event;
    }
  } catch (err) {
    console.error("Demo page fetch:", err);
  }

  const hasDemo = org && sampleEvent;

  return (
    <div className="hero-gradient mx-auto max-w-2xl space-y-8 px-4 py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300"
      >
        &larr; Back to home
      </Link>

      <div className="text-center">
        <h1 className="text-gradient text-3xl font-bold tracking-tight">
          Try the Demo
        </h1>
        <p className="mt-2 text-zinc-400">
          Explore the sample organizer dashboard and see how Organizer1st works.
        </p>
      </div>

      {hasDemo && org && sampleEvent ? (
        <div className="space-y-6">
          <div className="glass-card px-6 py-4 border-primary-500/20">
            <p className="text-sm text-primary-200">
              <strong>Sample Organizer</strong> has one event ready. Choose how you want to explore:
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href={`/admin5550/organizer-view/${org.id}`}
              className="glass-card card-lift flex flex-col p-6 transition-colors hover:border-primary-500/40"
            >
              <div className="feature-icon mb-3">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-zinc-50">
                Organizer view
              </h2>
              <p className="mt-1 flex-1 text-sm text-zinc-400">
                See the dashboard as an organizer: events, venues, orders, and attendee management.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-400">
                Open dashboard
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 5 7 7-7 7" />
                </svg>
              </span>
            </Link>

            <Link
              href={`/events/${sampleEvent.id}`}
              className="glass-card card-lift flex flex-col p-6 transition-colors hover:border-primary-500/40"
            >
              <div className="feature-icon mb-3">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-zinc-50">
                Attendee view
              </h2>
              <p className="mt-1 flex-1 text-sm text-zinc-400">
                Book seats, pick your spot on the seating chart, and complete a sample purchase.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-400">
                Book tickets
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 5 7 7-7 7" />
                </svg>
              </span>
            </Link>
          </div>

          <p className="text-center text-sm text-zinc-500">
            Want to edit events?{" "}
            <Link href="/login" className="text-primary-400 hover:text-primary-300">
              Log in as demo organizer
            </Link>{" "}
            (demo@organizer1st.com / Demo1234!)
          </p>
        </div>
      ) : (
        <div className="glass-card p-8 text-center">
          <p className="text-zinc-400">
            The demo isn&apos;t set up yet. Run the seed to create the sample organizer and event:
          </p>
          <code className="mt-4 block rounded-lg bg-zinc-800 px-4 py-3 font-mono text-sm text-zinc-300">
            npm run db:seed
          </code>
          <Link
            href="/#how-it-works"
            className="mt-6 inline-block text-sm text-primary-400 hover:text-primary-300"
          >
            Or learn how it works &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
