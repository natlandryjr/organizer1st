"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { getTranslations } from "@/lib/translations";

export function TranslatedFooter() {
  const { locale } = useLocale();
  const t = getTranslations(locale);

  return (
    <div className="grid gap-8 sm:grid-cols-3">
      <div>
        <div className="flex items-center gap-2.5">
          <img src="/favicon.png" alt="" className="h-6 w-6 rounded object-contain" />
          <span className="font-semibold text-zinc-200">Organizer1st</span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-zinc-500">{t.footerTagline}</p>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          {t.product}
        </h4>
        <ul className="space-y-2 text-sm text-zinc-500">
          <li>
            <Link href="/#how-it-works" className="hover:text-zinc-300">
              {t.howItWorksLink}
            </Link>
          </li>
          <li>
            <Link href="/demo" className="hover:text-zinc-300">
              {t.demo}
            </Link>
          </li>
          <li>
            <Link href="/faq" className="hover:text-zinc-300">
              {t.faq}
            </Link>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          {t.account}
        </h4>
        <ul className="space-y-2 text-sm text-zinc-500">
          <li>
            <Link href="/login" className="hover:text-zinc-300">
              {t.logIn}
            </Link>
          </li>
          <li>
            <Link href="/signup" className="hover:text-zinc-300">
              {t.signUp}
            </Link>
          </li>
          <li>
            <Link href="/dashboard" className="hover:text-zinc-300">
              {t.dashboard}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
