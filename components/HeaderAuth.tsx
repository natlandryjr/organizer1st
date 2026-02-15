"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type User = {
  id: string;
  name: string;
  email: string;
  organizationId: string;
} | null;

export function HeaderAuth() {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  if (loading) return null;

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
          >
            Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
          >
            Log out
          </button>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-accent-500 px-3 py-1.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-accent-400"
          >
            Sign up
          </Link>
        </>
      )}
    </div>
  );
}
