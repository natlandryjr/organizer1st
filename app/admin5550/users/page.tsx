"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  organization: { id: string; name: string };
};

type Organization = {
  id: string;
  name: string;
};

function UsersContent() {
  const searchParams = useSearchParams();
  const orgFilter = searchParams.get("organizationId") ?? "";

  const [users, setUsers] = useState<User[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formOrgId, setFormOrgId] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function loadUsers() {
    const url = orgFilter
      ? `/api/admin5550/users?organizationId=${orgFilter}`
      : "/api/admin5550/users";
    fetch(url)
      .then((r) => (r.ok ? r.json() : []))
      .then(setUsers)
      .catch(() => setUsers([]));
  }

  function loadOrgs() {
    fetch("/api/admin5550/organizations")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setOrgs(data);
        if (!formOrgId && data.length > 0) setFormOrgId(data[0].id);
      })
      .catch(() => setOrgs([]));
  }

  useEffect(() => {
    loadUsers();
    loadOrgs();
  }, [orgFilter]);

  useEffect(() => {
    setLoading(false);
  }, [users]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formPassword || !formOrgId) {
      setMessage({ type: "error", text: "Name, email, password, and organization are required" });
      return;
    }
    setCreating(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin5550/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          email: formEmail.trim(),
          password: formPassword,
          organizationId: formOrgId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");
      setFormName("");
      setFormEmail("");
      setFormPassword("");
      setMessage({ type: "success", text: `Created user ${data.email}` });
      setShowForm(false);
      loadUsers();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed" });
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this user?")) return;
    setDeletingId(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin5550/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      setMessage({ type: "success", text: "Deleted" });
      loadUsers();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed" });
    } finally {
      setDeletingId(null);
    }
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

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-medium text-zinc-300">Users</h2>
          {orgFilter && (
            <Link
              href={`/admin5550/organizer-view/${orgFilter}`}
              className="rounded bg-amber-500/20 px-3 py-1.5 text-sm font-medium text-amber-400 hover:bg-amber-500/30"
            >
              Organizer view
            </Link>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="rounded bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-400"
        >
          {showForm ? "Cancel" : "+ Add User"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-400">Name</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
              className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-400">Email</label>
            <input
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              required
              className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-400">Password</label>
            <input
              type="password"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-400">Organization</label>
            <select
              value={formOrgId}
              onChange={(e) => setFormOrgId(e.target.value)}
              className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100"
            >
              {orgs.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="rounded bg-amber-500 px-4 py-2 font-medium text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create User"}
          </button>
        </form>
      )}

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <ul className="divide-y divide-zinc-800">
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <span className="font-medium text-zinc-50">{u.name}</span>
                <span className="ml-3 text-sm text-zinc-400">{u.email}</span>
                <span className="ml-3 text-xs text-zinc-500">{u.organization.name}</span>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(u.id)}
                disabled={deletingId === u.id}
                className="rounded bg-red-900/50 px-3 py-1 text-sm text-red-400 hover:bg-red-900/70 disabled:opacity-50"
              >
                {deletingId === u.id ? "Deleting..." : "Delete"}
              </button>
            </li>
          ))}
        </ul>
        {users.length === 0 && (
          <div className="px-6 py-12 text-center text-zinc-500">No users</div>
        )}
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="text-zinc-400">Loading...</div>}>
      <UsersContent />
    </Suspense>
  );
}
