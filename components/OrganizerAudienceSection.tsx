"use client";

import { useLocale } from "@/components/LocaleProvider";
import { getTranslations } from "@/lib/translations";

const AUDIENCE_CARDS = [
  {
    key: "audienceCard1",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
        />
      </svg>
    ),
  },
  {
    key: "audienceCard2",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
  {
    key: "audienceCard3",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
  },
  {
    key: "audienceCard4",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    key: "audienceCard5",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
        />
      </svg>
    ),
  },
  {
    key: "audienceCard6",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 14l9-5-9-5-9 5 9 5z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
        />
      </svg>
    ),
  },
] as const;

const CARD_INDEX_TO_TITLE_KEY = [
  "audienceCard1Title",
  "audienceCard2Title",
  "audienceCard3Title",
  "audienceCard4Title",
  "audienceCard5Title",
  "audienceCard6Title",
] as const;

const CARD_INDEX_TO_DESC_KEY = [
  "audienceCard1Desc",
  "audienceCard2Desc",
  "audienceCard3Desc",
  "audienceCard4Desc",
  "audienceCard5Desc",
  "audienceCard6Desc",
] as const;

export function OrganizerAudienceSection() {
  const { locale } = useLocale();
  const t = getTranslations(locale);

  return (
    <section className="-mx-4 bg-gray-50 py-20 px-6 sm:-mx-6 sm:px-8 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t.audienceTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            {t.audienceSub}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {AUDIENCE_CARDS.map((card, i) => (
            <div
              key={card.key}
              className="rounded-2xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                {card.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t[CARD_INDEX_TO_TITLE_KEY[i]]}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {t[CARD_INDEX_TO_DESC_KEY[i]]}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-14 text-center text-base font-medium text-gray-700">
          {t.audienceClosing}
        </p>
      </div>
    </section>
  );
}
