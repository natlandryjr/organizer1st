"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { getTranslations } from "@/lib/translations";

function FaqAnswer({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);

    let linkIdx = linkMatch ? remaining.indexOf(linkMatch[0]) : -1;
    let boldIdx = boldMatch ? remaining.indexOf(boldMatch[0]) : -1;
    if (linkIdx < 0) linkIdx = Infinity;
    if (boldIdx < 0) boldIdx = Infinity;

    if (linkIdx < boldIdx && linkMatch) {
      parts.push(<span key={key++}>{remaining.slice(0, linkIdx)}</span>);
      parts.push(
        <a
          key={key++}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-400 underline hover:text-amber-300"
        >
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.slice(linkIdx + linkMatch[0].length);
    } else if (boldMatch) {
      parts.push(<span key={key++}>{remaining.slice(0, boldIdx)}</span>);
      parts.push(
        <strong key={key++} className="font-medium text-zinc-300">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldIdx + boldMatch[0].length);
    } else {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }
  }

  return <>{parts}</>;
}

const FAQ_KEYS = [
  "faq1",
  "faq2",
  "faq3",
  "faq4",
  "faq5",
  "faq6",
] as const;

export function FaqContent() {
  const { locale } = useLocale();
  const t = getTranslations(locale);

  const faqs = FAQ_KEYS.map((key) => ({
    question: t[`${key}Question` as keyof typeof t],
    answer: t[`${key}Answer` as keyof typeof t],
  }));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          {t.faqBackToHome}
        </Link>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-50">
          {t.faqTitle}
        </h1>
        <p className="mt-3 text-lg text-zinc-400">{t.faqSubtitle}</p>
      </div>

      <section className="space-y-8">
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6"
            >
              <h3 className="text-lg font-medium text-zinc-50">
                {faq.question}
              </h3>
              <div className="mt-3 text-zinc-400 leading-relaxed">
                <FaqAnswer text={faq.answer} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-8">
        <h2 className="text-xl font-semibold text-zinc-50">
          {t.faqMoreQuestionsTitle}
        </h2>
        <p className="mt-2 text-zinc-400">
          {t.faqMoreQuestionsPart1}
          <Link href="/signup" className="text-amber-400 hover:text-amber-300">
            {t.faqMoreQuestionsLink1}
          </Link>
          {t.faqMoreQuestionsPart2}
          <Link href="/dashboard" className="text-amber-400 hover:text-amber-300">
            {t.faqMoreQuestionsLink2}
          </Link>
          {t.faqMoreQuestionsPart3}
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            href="/login"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-zinc-600 px-4 py-3 font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            {t.logIn}
          </Link>
          <Link
            href="/signup"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-amber-500 px-4 py-3 font-medium text-zinc-950 transition-colors hover:bg-amber-400"
          >
            {t.signUp}
          </Link>
        </div>
      </section>
    </div>
  );
}
