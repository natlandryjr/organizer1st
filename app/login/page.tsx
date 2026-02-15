"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
        Welcome back
      </h1>
      <p className="mt-2 text-zinc-400">
        Sign in to your Organizer1st account.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-zinc-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="min-h-[44px] w-full rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:border-accent-500/60 focus:outline-none focus:ring-1 focus:ring-accent-500/40 sm:py-2.5"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-zinc-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="min-h-[44px] w-full rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:border-accent-500/60 focus:outline-none focus:ring-1 focus:ring-accent-500/40 sm:py-2.5"
            placeholder="Your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-glow min-h-[48px] w-full rounded-xl bg-accent-500 px-4 py-3 font-semibold text-zinc-950 transition-colors hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation"
        >
          {loading ? "Signing in..." : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-accent-400 hover:text-accent-300">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-md animate-pulse space-y-6">
        <div className="h-8 w-48 rounded bg-zinc-800" />
        <div className="h-4 w-64 rounded bg-zinc-800" />
        <div className="h-12 w-full rounded-xl bg-zinc-800" />
        <div className="h-12 w-full rounded-xl bg-zinc-800" />
        <div className="h-12 w-full rounded-xl bg-zinc-800" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
