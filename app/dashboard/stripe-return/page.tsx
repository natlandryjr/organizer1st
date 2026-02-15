import Link from "next/link";

export default async function StripeReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const params = await searchParams;
  const success = params.success === "1";

  return (
    <div className="mx-auto max-w-md text-center">
      {success ? (
        <>
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-400">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-zinc-50">
            Stripe account connected successfully!
          </h1>
          <p className="mt-2 text-zinc-400">
            Your organization is now set up to receive ticket payments directly.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-zinc-50">
            Stripe connection
          </h1>
          <p className="mt-2 text-zinc-400">
            Complete the Stripe onboarding to connect your account.
          </p>
        </>
      )}

      <Link
        href="/dashboard/settings"
        className="btn-glow mt-8 inline-block rounded-xl bg-accent-500 px-6 py-3 font-semibold text-zinc-950 transition-colors hover:bg-accent-400"
      >
        Back to Settings
      </Link>
    </div>
  );
}
