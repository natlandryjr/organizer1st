"use client";

import { useState } from "react";

type Props = {
  organizationId: string;
  organizationName: string;
  stripeAccountId: string | null;
};

export function OrganizationSettingsForm({
  organizationName,
  stripeAccountId,
}: Props) {
  const [name, setName] = useState(organizationName);
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/dashboard/organization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to save" });
        return;
      }

      setMessage({ type: "success", text: "Organization name updated." });
    } catch {
      setMessage({ type: "error", text: "Something went wrong." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-8 space-y-8">
      <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6">
        <h2 className="text-lg font-semibold text-zinc-50">Organization Name</h2>
        <form onSubmit={handleSaveName} className="mt-4 flex flex-wrap items-end gap-4">
          <div className="min-w-0 flex-1">
            <label htmlFor="org-name" className="sr-only">
              Organization name
            </label>
            <input
              id="org-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-4 py-2.5 text-zinc-100 placeholder-zinc-500 focus:border-accent-500/60 focus:outline-none focus:ring-1 focus:ring-accent-500/40"
              placeholder="Your organization name"
            />
          </div>
          <button
            type="submit"
            disabled={saving || name === organizationName}
            className="rounded-xl bg-accent-500 px-4 py-2.5 font-medium text-zinc-950 transition-colors hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </form>
        {message && (
          <p
            className={`mt-3 text-sm ${
              message.type === "success" ? "text-green-400" : "text-red-400"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6">
        <h2 className="text-lg font-semibold text-zinc-50">Stripe</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Connect your Stripe account to receive ticket payments directly.
        </p>
        <div className="mt-4">
          {stripeAccountId ? (
            <p className="text-sm text-green-400">
              ✓ Connected to Stripe
            </p>
          ) : (
            <button
              type="button"
              disabled={connecting}
              onClick={async () => {
                setConnecting(true);
                setMessage(null);
                try {
                  const res = await fetch("/api/stripe/connect-account", {
                    method: "POST",
                  });
                  const data = await res.json();
                  if (!res.ok) {
                    setMessage({ type: "error", text: data.error ?? "Failed to connect" });
                    return;
                  }
                  if (data.url) {
                    window.location.href = data.url;
                  }
                } catch {
                  setMessage({ type: "error", text: "Something went wrong." });
                } finally {
                  setConnecting(false);
                }
              }}
              className="btn-glow rounded-xl bg-primary-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {connecting ? "Connecting..." : "Connect with Stripe"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
