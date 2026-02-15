import Link from "next/link";
import { RestartTourButton } from "./RestartTourButton";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
        Dashboard
      </h1>
      <p className="mt-2 text-zinc-400">
        Welcome to your Organizer1st dashboard. Manage your organization and events.{" "}
        <RestartTourButton />
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/settings"
          className="card-lift block rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6"
        >
          <h2 className="font-semibold text-zinc-50">Organization Settings</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Update your organization name and connect Stripe.
          </p>
        </Link>
        <Link
          href="/admin5550"
          className="card-lift block rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6"
        >
          <h2 className="font-semibold text-zinc-50">Create Event</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Set up a new event with seating and ticketing.
          </p>
        </Link>
      </div>
    </div>
  );
}
