import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h1 className="text-2xl font-bold text-zinc-50">Page not found</h1>
      <p className="mt-2 text-zinc-400">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-amber-500 px-4 py-2 font-semibold text-zinc-950 transition-colors hover:bg-amber-400"
      >
        Return to home
      </Link>
    </div>
  );
}
