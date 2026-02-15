"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin5550", label: "Events" },
  { href: "/admin5550/organizations", label: "Organizations" },
  { href: "/admin5550/users", label: "Users" },
  { href: "/admin5550/venues", label: "Venues" },
];

export default function Admin5550Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            ← Back to site
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-zinc-50">
            Super Admin
          </h1>
        </div>
      </div>

      <nav className="flex flex-wrap gap-2 border-b border-zinc-800 pb-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin5550"
              ? pathname === "/admin5550"
              : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-amber-500/20 text-amber-400"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
