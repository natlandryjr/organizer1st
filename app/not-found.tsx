import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mesh-gradient flex flex-col items-center justify-center py-24 text-center animate-fade-in">
      <p className="text-gradient text-8xl font-bold tracking-tighter sm:text-9xl">404</p>
      <h1 className="mt-4 text-2xl font-bold text-zinc-50">Page not found</h1>
      <p className="mt-2 text-zinc-400">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="btn-glow mt-8 inline-block rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 font-semibold text-white shadow-lg shadow-primary-500/20"
      >
        Return to home
      </Link>
    </div>
  );
}
