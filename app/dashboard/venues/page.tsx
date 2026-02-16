import Link from "next/link";
import { VenuesList } from "./VenuesList";

export default function VenuesPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
            Venue Maps
          </h1>
          <p className="mt-2 text-zinc-400">
            Create and manage reusable venue layouts for your events.
          </p>
        </div>
        <Link
          href="/dashboard/venues/new"
          className="rounded-xl bg-amber-500 px-4 py-2.5 font-medium text-zinc-950 transition-colors hover:bg-amber-400"
        >
          Create Venue
        </Link>
      </div>
      <div className="mt-8">
        <VenuesList />
      </div>
    </div>
  );
}
