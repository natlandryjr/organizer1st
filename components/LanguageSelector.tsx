"use client";

import { useLocale } from "@/components/LocaleProvider";
import { LOCALES, type Locale } from "@/lib/translations";
import { useRef, useEffect, useState } from "react";

export function LanguageSelector() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-zinc-700/60 bg-zinc-800/50 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Select language"
      >
        <svg
          className="h-4 w-4 text-zinc-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          />
        </svg>
        <span>{current.native}</span>
        <svg
          className={`h-4 w-4 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-50 mt-1.5 min-w-[160px] overflow-hidden rounded-xl border border-zinc-700/60 bg-zinc-900 shadow-xl"
        >
          {LOCALES.map((opt) => (
            <li key={opt.code} role="option" aria-selected={opt.code === locale}>
              <button
                type="button"
                onClick={() => {
                  setLocale(opt.code as Locale);
                  setOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-zinc-800 ${
                  opt.code === locale ? "bg-primary-500/10 text-primary-400" : "text-zinc-300"
                }`}
              >
                {opt.native}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
