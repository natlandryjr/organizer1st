"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";

const CheckInScanner = dynamic(
  () => import("@/components/CheckInScanner").then((m) => m.CheckInScanner),
  { ssr: false }
);

type ScanResult = "idle" | "success" | "error" | "already";

export default function CheckInPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const [eventName, setEventName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ScanResult>("idle");
  const [attendeeName, setAttendeeName] = useState("");
  const [ticketType, setTicketType] = useState("");
  const [resultMessage, setResultMessage] = useState("");

  useEffect(() => {
    async function loadEvent() {
      try {
        const res = await fetch(`/api/dashboard/events/${eventId}/attendees`);
        if (!res.ok) {
          if (res.status === 401) {
            router.replace("/login?redirect=/checkin/" + eventId);
            return;
          }
          const data = await res.json();
          throw new Error(data.error ?? "Failed to load");
        }
        const data = await res.json();
        setEventName(data.event?.name ?? "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load event");
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [eventId, router]);

  const handleScan = useCallback(
    async (ticketId: string) => {
      setResult("idle");
      setResultMessage("");
      try {
        const res = await fetch(`/api/checkin/${eventId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticketId }),
        });
        const data = await res.json();

        if (res.ok && data.success) {
          setResult("success");
          setAttendeeName(data.attendeeName ?? "");
          setTicketType(data.ticketType ?? "General");
          setResultMessage("Checked in!");
          setTimeout(() => {
            setResult("idle");
            setResultMessage("");
          }, 3000);
          return;
        }

        if (res.status === 409 && data.attendeeName) {
          setResult("already");
          setAttendeeName(data.attendeeName ?? "");
          setTicketType(data.ticketType ?? "General");
          setResultMessage("Already checked in");
          setTimeout(() => {
            setResult("idle");
            setResultMessage("");
          }, 3000);
          return;
        }

        setResult("error");
        setResultMessage(data.error ?? "Invalid ticket");
        setTimeout(() => {
          setResult("idle");
          setResultMessage("");
        }, 3000);
      } catch {
        setResult("error");
        setResultMessage("Network error");
        setTimeout(() => {
          setResult("idle");
          setResultMessage("");
        }, 3000);
      }
    },
    [eventId]
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-zinc-700 border-t-accent-500" />
        <p className="mt-4 text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md space-y-6 py-12">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-4 text-red-400">
          {error}
        </div>
        <Link
          href="/dashboard/events"
          className="inline-flex items-center gap-1.5 text-accent-500 hover:text-accent-400"
        >
          ← Back to events
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      {/* Mobile-first header */}
      <div className="mb-6">
        <Link
          href={`/dashboard/events/${eventId}/attendees`}
          className="text-sm text-zinc-500 hover:text-zinc-300"
        >
          ← Back to attendees
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-50">
          QR Check-in
        </h1>
        {eventName && (
          <p className="mt-1 text-zinc-400">{eventName}</p>
        )}
      </div>

      {/* Scanner area */}
      <div className="overflow-hidden glass-card">
        <div className="relative aspect-square w-full max-w-[min(100vw-2rem,400px)] mx-auto">
          <CheckInScanner onScan={handleScan} />
          {/* Scan overlay frame */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-56 w-56 rounded-2xl border-2 border-accent-500/60 bg-transparent" />
          </div>
        </div>
      </div>

      {/* Result feedback */}
      {result !== "idle" && (
        <div
          className={`mt-6 glass-card px-5 py-4 ${
            result === "success"
              ? "!border-emerald-500/40"
              : result === "already"
              ? "!border-primary-500/40"
              : "!border-red-500/40"
          }`}
        >
          <p
            className={`font-semibold ${
              result === "success"
                ? "text-emerald-400"
                : result === "already"
                ? "text-accent-400"
                : "text-red-400"
            }`}
          >
            {resultMessage}
          </p>
          {(result === "success" || result === "already") && (
            <div className="mt-3 space-y-1 text-sm text-zinc-300">
              <p>
                <span className="text-zinc-500">Name:</span> {attendeeName}
              </p>
              <p>
                <span className="text-zinc-500">Ticket:</span> {ticketType}
              </p>
            </div>
          )}
        </div>
      )}

      {result === "idle" && (
        <p className="mt-4 text-center text-sm text-zinc-500">
          Point the camera at the attendee&apos;s QR code
        </p>
      )}
    </div>
  );
}
