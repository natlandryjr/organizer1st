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
        <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <a href="/" className="group flex items-center gap-2.5 transition-colors">
              <img
                src="/favicon.png"
                alt="Organizer1st"
                className="h-8 w-8 rounded-lg object-contain transition-opacity group-hover:opacity-90"
              />
              <span className="text-lg font-semibold tracking-tight text-zinc-50 transition-colors group-hover:text-amber-400">
                Organizer1st
              </span>
            </a>
            <HeaderAuth />
          </div>
          {/* Subtle gradient accent line */}
          <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
        </header>

        <main className="mx-auto max-w-7xl px-4 pb-32 pt-8 sm:pb-8 sm:px-6 lg:px-8">
          {children}
        </main>

        <footer className="border-t border-zinc-800/60 bg-zinc-950/90">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-zinc-500">
                <img src="/favicon.png" alt="" className="h-4 w-4 rounded object-contain opacity-80" />
                <span>&copy; {new Date().getFullYear()} Organizer1st</span>
                <Link href="/help" className="hover:text-zinc-400">
                  Help
                </Link>
              </div>
              <p className="text-xs text-zinc-600">
                Live music. Good vibes. Great seats.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
