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
            href="/help"
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
          >
            Help
          </Link>
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
          <div className="h-5 w-px bg-zinc-700" />
          <Link
            href="/signup"
            className="btn-glow flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-primary-500/20 touch-manipulation"
          >
            Sign up
          </Link>
        </>
      )}
    </div>
  );
}
