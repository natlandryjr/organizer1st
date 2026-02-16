import type { Metadata, Viewport } from "next";
import "./globals.css";
import { HeaderAuth } from "@/components/HeaderAuth";
import { LanguageSelector } from "@/components/LanguageSelector";
import { LocaleProvider } from "@/components/LocaleProvider";
import { TranslatedFooter } from "@/components/TranslatedFooter";

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
        <LocaleProvider>
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
              <div className="flex items-center gap-3">
                <LanguageSelector />
                <HeaderAuth />
              </div>
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
              <TranslatedFooter />
              <div className="mt-10 border-t border-zinc-800/40 pt-6 text-center text-xs text-zinc-600">
                &copy; {new Date().getFullYear()} Organizer1st. All rights reserved.
              </div>
            </div>
          </footer>
        </LocaleProvider>
      </body>
    </html>
  );
}
