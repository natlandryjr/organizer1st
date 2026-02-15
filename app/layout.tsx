import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
  preload: false,
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "SweetJazz.Org Ticketing",
  description: "Event ticketing for SweetJazz.Org",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} noise-overlay antialiased min-h-screen bg-zinc-950 text-zinc-100`}
      >
        <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <a href="/" className="group flex items-center gap-2.5 transition-colors">
              {/* Music note icon */}
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 transition-colors group-hover:bg-amber-500/20">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </span>
              <span className="text-lg font-semibold tracking-tight text-zinc-50 transition-colors group-hover:text-amber-400">
                SweetJazz<span className="text-amber-500">.Org</span>
              </span>
            </a>
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
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-amber-500/60">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
                <span>&copy; {new Date().getFullYear()} SweetJazz.Org</span>
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
