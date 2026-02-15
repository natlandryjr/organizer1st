"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { downloadCsv } from "@/lib/csv";
import { EmailEditor } from "@/components/EmailEditor";

type Attendee = {
  id: string;
  name: string;
  email: string;
  ticketType: string;
  orderNumber: string;
  createdAt: string;
};

export default function AttendeesPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [eventName, setEventName] = useState("");
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailResult, setEmailResult] = useState<{ sent: number; total: number; failed?: number } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/dashboard/events/${eventId}/attendees`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Failed to load");
        }
        const data = await res.json();
        setAttendees(data.attendees ?? []);
        setEventName(data.event?.name ?? "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load attendees");
        setAttendees([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [eventId]);

  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailSending(true);
    setEmailResult(null);
    setError("");
    try {
      const res = await fetch(`/api/dashboard/events/${eventId}/attendees/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: emailSubject, body: emailBody }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to send");
      }
      setEmailResult({ sent: data.sent, total: data.total, failed: data.failed });
      if (data.sent > 0) {
        setEmailSubject("");
        setEmailBody("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send emails");
    } finally {
      setEmailSending(false);
    }
  }

  function exportToCsv() {
    const data = attendees.map((a) => ({
      Name: a.name,
      Email: a.email,
      "Ticket Type": a.ticketType,
      "Order Number": a.orderNumber,
    }));
    const filename = `attendees-${eventName.replace(/[^a-z0-9]/gi, "-")}-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCsv(data, filename, ["Name", "Email", "Ticket Type", "Order Number"]);
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-zinc-800" />
        <div className="h-64 rounded-xl border border-zinc-800 bg-zinc-900/30" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard/events"
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            ← Events
          </Link>
          <h1 className="mt-2 text-xl font-bold tracking-tight text-zinc-50 sm:text-2xl">
            Attendees
            {eventName && (
              <span className="ml-2 text-base font-normal text-zinc-400 sm:text-lg">
                — {eventName}
              </span>
            )}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/checkin/${eventId}`}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-amber-500 px-4 py-3 font-medium text-zinc-950 transition-colors hover:bg-amber-400 touch-manipulation sm:py-2.5"
          >
            QR Check-in
          </Link>
          <button
            type="button"
            onClick={() => {
              setEmailModalOpen(true);
              setEmailResult(null);
              setError("");
            }}
            disabled={attendees.length === 0}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-zinc-600 px-4 py-3 font-medium text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-50 touch-manipulation sm:py-2.5"
          >
            Email Attendees
          </button>
          <button
            type="button"
            onClick={exportToCsv}
            disabled={attendees.length === 0}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-zinc-600 px-4 py-3 font-medium text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-50 touch-manipulation sm:py-2.5"
          >
            Export to CSV
          </button>
        </div>
      </div>

      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl border border-zinc-800/60 bg-zinc-900 p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-50">Email Attendees</h2>
              <button
                type="button"
                onClick={() => {
                  setEmailModalOpen(false);
                  setEmailResult(null);
                }}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 touch-manipulation"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <p className="mb-4 text-sm text-zinc-500">
              Send an email to all {attendees.length} attendee{attendees.length !== 1 ? "s" : ""}.
            </p>
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label htmlFor="email-subject" className="mb-1 block text-sm font-medium text-zinc-300">
                  Subject
                </label>
                <input
                  id="email-subject"
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  required
                  placeholder="e.g. Important update about your event"
                  className="min-h-[44px] w-full rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40 sm:py-2.5"
                />
              </div>
              <div>
                <label htmlFor="email-body" className="mb-1 block text-sm font-medium text-zinc-300">
                  Message
                </label>
                <EmailEditor
                  value={emailBody}
                  onChange={setEmailBody}
                  placeholder="Write your message..."
                />
              </div>
              {emailResult && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                  Sent to {emailResult.sent} of {emailResult.total} recipient{emailResult.total !== 1 ? "s" : ""}
                  {emailResult.failed ? ` (${emailResult.failed} failed)` : ""}.
                </div>
              )}
              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={emailSending}
                  className="min-h-[44px] rounded-xl bg-amber-500 px-4 py-3 font-medium text-zinc-950 hover:bg-amber-400 disabled:opacity-50 touch-manipulation sm:py-2.5"
                >
                  {emailSending ? "Sending..." : "Send Email"}
                </button>
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(false)}
                  className="min-h-[44px] rounded-xl border border-zinc-600 px-4 py-3 font-medium text-zinc-300 hover:bg-zinc-800 touch-manipulation sm:py-2.5"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/30">
        {attendees.length === 0 ? (
          <div className="px-8 py-16 text-center">
            <p className="text-zinc-400">No attendees yet</p>
            <Link
              href={`/events/${eventId}`}
              className="mt-4 inline-block text-amber-500 hover:text-amber-400"
            >
              View event page
            </Link>
          </div>
        ) : (
          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-zinc-800/60 bg-zinc-800/30">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400 sm:px-6 sm:py-4">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400 sm:px-6 sm:py-4">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400 sm:px-6 sm:py-4">
                    Ticket Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400 sm:px-6 sm:py-4">
                    Order Number
                  </th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-zinc-800/40 transition-colors hover:bg-zinc-800/20"
                  >
                    <td className="px-4 py-3 font-medium text-zinc-50 sm:px-6 sm:py-4">
                      {a.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400 sm:px-6 sm:py-4">
                      {a.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400 sm:px-6 sm:py-4">
                      {a.ticketType}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-zinc-400 sm:px-6 sm:py-4">
                      #{a.orderNumber}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
