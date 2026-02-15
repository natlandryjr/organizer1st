"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Overview", dataTour: "nav-overview" },
  { href: "/dashboard/analytics", label: "Analytics", dataTour: "nav-analytics" },
  { href: "/dashboard/events", label: "Events", dataTour: "nav-events" },
  { href: "/dashboard/orders", label: "Orders", dataTour: "nav-orders" },
  { href: "/dashboard/venues", label: "Venues", dataTour: "nav-venues" },
  { href: "/dashboard/settings", label: "Organization", dataTour: "nav-organization" },
  { href: "/admin5550", label: "Create Event", dataTour: "nav-create-event" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-4 border-b border-zinc-800/60 pb-4">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
        return (
          <Link
            key={item.href}
            href={item.href}
            data-tour={item.dataTour}
            className={`text-sm font-medium transition-colors ${
              isActive ? "text-accent-400" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
