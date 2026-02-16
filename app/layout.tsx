import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { HeaderAuth } from "@/components/HeaderAuth";

export const metadata: Metadata = {
  title: "Organizer1st Ticketing",
  description: "Event ticketing for Organizer1st",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className="noise-overlay antialiased min-h-screen bg-zinc-950 text-zinc-100"
      >
        <header className="sticky top-0 z-40 border-b border-zinc-800/60 bg-zinc-950/70 backdrop-blur-xl backdrop-saturate-150 pt-[env(safe-area-inset-top)]">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <a href="/" className="group flex items-center gap-2.5 transition-colors">
              <img
                src="/favicon.png"
                alt="Organizer1st"
                className="h-8 w-8 rounded-lg object-contain transition-opacity group-hover:opacity-90"
              />
              <span className="text-lg font-semibold tracking-tight text-zinc-50 transition-colors group-hover:text-primary-400">
                Organizer1st
              </span>
            </a>
            <HeaderAuth />
          </div>
          {/* Gradient accent line — blue to violet */}
          <div className="section-divider" />
        </header>

        <main className="mx-auto max-w-7xl px-4 pb-32 pt-8 sm:pb-8 sm:px-6 lg:px-8">
          {children}
        </main>

        <footer className="border-t border-zinc-800/60 bg-zinc-950/90">
          <div className="section-divider" />
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-3">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-2.5">
                  <img src="/favicon.png" alt="" className="h-6 w-6 rounded object-contain" />
                  <span className="font-semibold text-zinc-200">Organizer1st</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                  The ticketing platform that puts organizers first. Live music. Good vibes. Great seats.
                </p>
              </div>
              {/* Product links */}
              <div>
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">Product</h4>
                <ul className="space-y-2 text-sm text-zinc-500">
                  <li><Link href="/#how-it-works" className="hover:text-zinc-300">How It Works</Link></li>
                  <li><Link href="/demo" className="hover:text-zinc-300">Demo</Link></li>
                  <li><Link href="/faq" className="hover:text-zinc-300">FAQ</Link></li>
                </ul>
              </div>
              {/* Account links */}
              <div>
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">Account</h4>
                <ul className="space-y-2 text-sm text-zinc-500">
                  <li><Link href="/login" className="hover:text-zinc-300">Log in</Link></li>
                  <li><Link href="/signup" className="hover:text-zinc-300">Sign up</Link></li>
                  <li><Link href="/dashboard" className="hover:text-zinc-300">Dashboard</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-10 border-t border-zinc-800/40 pt-6 text-center text-xs text-zinc-600">
              &copy; {new Date().getFullYear()} Organizer1st. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
