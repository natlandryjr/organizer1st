"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Organization = {
  id: string;
  name: string;
  stripeAccountId: string | null;
  _count: { users: number; events: number; venues: number };
};

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function load() {
    fetch("/api/admin5550/organizations")
      .then((r) => (r.ok ? r.json() : []))
      .then(setOrgs)
      .catch(() => setOrgs([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin5550/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");
      setNewName("");
      setMessage({ type: "success", text: `Created "${data.name}"` });
      load();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed" });
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) return;
    setMessage(null);
    try {
      const res = await fetch(`/api/admin5550/organizations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setEditingId(null);
      setMessage({ type: "success", text: "Updated" });
      load();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed" });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this organization? All users, events, and venues will be deleted.")) return;
    setDeletingId(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin5550/organizations/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      setMessage({ type: "success", text: "Deleted" });
      load();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed" });
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <div className="text-zinc-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`rounded-lg p-4 ${
            message.type === "success"
              ? "bg-green-900/30 text-green-300 border border-green-800"
              : "bg-red-900/30 text-red-300 border border-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-4 text-lg font-medium text-zinc-300">Create Organization</h2>
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Organization name"
            className="flex-1 rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="rounded bg-amber-500 px-4 py-2 font-medium text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <h2 className="border-b border-zinc-800 px-6 py-4 text-lg font-medium text-zinc-300">
          All Organizations
        </h2>
        <ul className="divide-y divide-zinc-800">
          {orgs.map((org) => (
            <li key={org.id} className="flex items-center justify-between gap-4 px-6 py-4">
              {editingId === org.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 rounded border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdate(org.id)}
                    className="text-sm text-amber-400 hover:text-amber-300"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="text-sm text-zinc-500 hover:text-zinc-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-zinc-50">{org.name}</span>
                  <span className="ml-3 text-xs text-zinc-500">
                    {org._count.users} users · {org._count.events} events · {org._count.venues} venues
                  </span>
                  {org.stripeAccountId && (
                    <span className="ml-2 text-xs text-green-500">Stripe connected</span>
                  )}
                </div>
              )}
              {editingId !== org.id && (
                <div className="flex gap-2 shrink-0">
                  <Link
                    href={`/admin5550/organizer-view/${org.id}`}
                    className="rounded bg-amber-500/20 px-3 py-1 text-sm font-medium text-amber-400 hover:bg-amber-500/30"
                  >
                    Organizer view
                  </Link>
                  <Link
                    href={`/admin5550/users?organizationId=${org.id}`}
                    className="rounded bg-zinc-700 px-3 py-1 text-sm text-zinc-300 hover:bg-zinc-600"
                  >
                    Users
                  </Link>
                  <Link
                    href={`/admin5550?organizationId=${org.id}`}
                    className="rounded bg-zinc-700 px-3 py-1 text-sm text-zinc-300 hover:bg-zinc-600"
                  >
                    Events
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(org.id);
                      setEditName(org.name);
                    }}
                    className="rounded bg-zinc-700 px-3 py-1 text-sm text-zinc-300 hover:bg-zinc-600"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(org.id)}
                    disabled={deletingId === org.id}
                    className="rounded bg-red-900/50 px-3 py-1 text-sm text-red-400 hover:bg-red-900/70 disabled:opacity-50"
                  >
                    {deletingId === org.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
        {orgs.length === 0 && (
          <div className="px-6 py-12 text-center text-zinc-500">No organizations yet</div>
        )}
      </div>
    </div>
  );
}
