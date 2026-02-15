import Link from "next/link";

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

export const metadata = {
  title: "Help & FAQ | Organizer1st",
  description: "Get help with Organizer1st. Learn how to connect Stripe, create events, set up seating, and get paid.",
};

const faqs = [
  {
    question: "How do I connect my Stripe account?",
    answer:
      "Go to your Dashboard and click **Organization Settings** (or **Organization** in the sidebar). In the Organization Settings page, you'll see a **Connect Stripe** button. Click it to start the Stripe Connect onboarding flow. You'll be guided through creating or linking your Stripe account. Once connected, ticket revenue will flow directly into your Stripe account. You can disconnect and reconnect at any time from the same settings page.",
  },
  {
    question: "How do I create an event?",
    answer:
      "From your Dashboard, click **Create Event** in the navigation, or go to **Events** and click **Create New Event**. Fill in the event details: name, description, date and time, and location. Select a venue map if you have one set up (or create a venue first under **Venues**). Add ticket types with names and prices, and optionally add promo codes. Set the status to **Published** when you're ready to sell tickets. Your event page will be live at `/events/[your-event-id]`.",
  },
  {
    question: "How do I set up seating?",
    answer:
      "Seating is configured through **Venues**. Go to **Venues** in the dashboard and create a new venue or edit an existing one. You can design a floor plan with **Sections** (grids of seats) and **Tables** (round tables with seats around them). Each section or table can be assigned a ticket type (e.g., VIP, General Admission). Once your venue is saved, select it when creating or editing an event. Attendees will see the seating chart when purchasing tickets.",
  },
  {
    question: "When do I get paid?",
    answer:
      "Organizer1st uses Stripe Connect, so payments go directly to your connected Stripe account. Stripe typically deposits funds within 2–7 business days, depending on your account and region. You can view payout schedules and transaction details in your [Stripe Dashboard](https://dashboard.stripe.com). Organizer1st charges a simple flat fee per ticket—there are no hidden percentages or surprise charges.",
  },
  {
    question: "How do I manage attendees and check-in?",
    answer:
      "For each event, go to **Events** → select your event → **Attendees**. Here you can view all attendees, export to CSV, and send bulk emails. Use **QR Check-in** to open a mobile-friendly scanner. Attendees receive a confirmation email with a QR code containing their ticket ID. Scan the QR code at the door to mark them as checked in.",
  },
  {
    question: "Can I use promo codes?",
    answer:
      "Yes. When creating or editing an event, scroll to the **Promo Codes** section. Add codes with either a percentage discount (e.g., 10% off) or a flat discount (e.g., $5 off). Attendees enter the promo code during checkout to apply the discount.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to home
        </Link>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-50">
          Help & FAQ
        </h1>
        <p className="mt-3 text-lg text-zinc-400">
          Everything you need to get started with Organizer1st.
        </p>
      </div>

      <section className="space-y-8">
        <h2 className="text-xl font-semibold text-zinc-50">
          Frequently Asked Questions
        </h2>
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
          Need more help?
        </h2>
        <p className="mt-2 text-zinc-400">
          If you&apos;re an organizer, sign in to your dashboard to access all
          features. New to Organizer1st?{" "}
          <Link href="/signup" className="text-amber-400 hover:text-amber-300">
            Create an account
          </Link>{" "}
          to get started. Already have an account? Visit your{" "}
          <Link href="/dashboard" className="text-amber-400 hover:text-amber-300">
            dashboard
          </Link>{" "}
          — first-time visitors will see a guided tour.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            href="/login"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-zinc-600 px-4 py-3 font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-amber-500 px-4 py-3 font-medium text-zinc-950 transition-colors hover:bg-amber-400"
          >
            Sign up
          </Link>
        </div>
      </section>
    </div>
  );
}
