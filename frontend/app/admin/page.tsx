"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, LogOut, Plus } from "lucide-react";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { api, ApiError } from "../lib/api";
import type { AdminApp, AppInput } from "../lib/types";
import { ApplicationForm } from "./components/ApplicationForm";
import { ApplicationList } from "./components/ApplicationList";
import { LoginForm } from "./components/LoginForm";

type AuthState = "checking" | "signed-out" | "signed-in";

const EMPTY: AppInput = { name: "", description: "", url: "", icon: "layout-grid", status: "available", enabled: true, order: 0 };

function toInput(app: AdminApp): AppInput {
  const { name, description, url, icon, status, enabled, order } = app;
  return { name, description, url, icon, status, enabled, order };
}

export default function AdminPage() {
  const [auth, setAuth] = useState<AuthState>("checking");

  useEffect(() => {
    api<{ authenticated: boolean }>("/auth/session")
      .then((s) => setAuth(s.authenticated ? "signed-in" : "signed-out"))
      .catch(() => setAuth("signed-out"));
  }, []);

  const logout = async () => {
    await api("/auth/logout", { method: "POST" }).catch(() => {});
    setAuth("signed-out");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader subtitle="Admin Panel">
        <Link href="/" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900">
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">View Dashboard</span>
        </Link>
        {auth === "signed-in" && (
          <button onClick={logout} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </button>
        )}
      </SiteHeader>

      <main className="w-full flex-1 px-4 py-8 sm:px-6 lg:px-10">
        {auth === "checking" && <p className="text-slate-500">Loading…</p>}
        {auth === "signed-out" && <LoginForm onSuccess={() => setAuth("signed-in")} />}
        {auth === "signed-in" && <Manager onUnauthorized={() => setAuth("signed-out")} />}
      </main>

      <SiteFooter />
    </div>
  );
}

function Manager({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [apps, setApps] = useState<AdminApp[] | null>(null);
  const [editing, setEditing] = useState<AdminApp | "new" | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  /** Run an admin API call; an expired session sends the user back to login. */
  const call = useCallback(
    async <T,>(path: string, options?: { method?: string; body?: unknown }) => {
      try {
        return await api<T>(path, options);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) onUnauthorized();
        throw err;
      }
    },
    [onUnauthorized]
  );

  const load = useCallback(async () => {
    try {
      setApps(await call<AdminApp[]>("/admin/applications"));
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Could not load applications." });
    }
  }, [call]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
    load();
  }, [load]);

  const flash = (text: string) => setMessage({ kind: "ok", text });
  const fail = (err: unknown) => setMessage({ kind: "error", text: err instanceof Error ? err.message : "Request failed." });

  const save = async (input: AppInput) => {
    if (editing === "new") {
      const body: Partial<AppInput> = { ...input };
      delete body.order; // the server places new applications at the end
      await call("/admin/applications", { method: "POST", body });
      flash(`“${input.name}” added.`);
    } else if (editing) {
      await call(`/admin/applications/${editing.id}`, { method: "PUT", body: input });
      flash(`“${input.name}” updated.`);
    }
    setEditing(null);
    await load();
  };

  const toggle = async (app: AdminApp) => {
    setBusyId(app.id);
    try {
      await call(`/admin/applications/${app.id}`, { method: "PATCH", body: { enabled: !app.enabled } });
      flash(`“${app.name}” ${app.enabled ? "disabled and hidden from" : "enabled and shown on"} the dashboard.`);
      await load();
    } catch (err) {
      fail(err);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (app: AdminApp) => {
    if (!window.confirm(`Delete “${app.name}”? This cannot be undone.`)) return;
    setBusyId(app.id);
    try {
      await call(`/admin/applications/${app.id}`, { method: "DELETE" });
      flash(`“${app.name}” deleted.`);
      await load();
    } catch (err) {
      fail(err);
    } finally {
      setBusyId(null);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    if (!apps) return;
    const next = [...apps];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    setApps(next);
    setBusyId("reorder");
    try {
      setApps(await call<AdminApp[]>("/admin/applications/order", { method: "PUT", body: { ids: next.map((a) => a.id) } }));
    } catch (err) {
      fail(err);
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const enabledCount = apps?.filter((a) => a.enabled).length ?? 0;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-blue-950">Manage Applications</h1>
          <p className="mt-1 text-sm text-slate-500">
            {apps ? `${apps.length} application${apps.length === 1 ? "" : "s"}, ${enabledCount} shown on the dashboard.` : "Loading…"} Changes
            appear on the dashboard immediately.
          </p>
        </div>
        <button
          onClick={() => setEditing("new")}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Application
        </button>
      </div>

      {message && (
        <div
          role="status"
          className={`mt-5 flex items-start justify-between gap-3 rounded-lg p-3 text-sm ${
            message.kind === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="mt-6">{apps && <ApplicationList apps={apps} busyId={busyId} onEdit={setEditing} onDelete={remove} onToggle={toggle} onMove={move} />}</div>

      {editing && (
        <ApplicationForm
          key={editing === "new" ? "new" : editing.id}
          title={editing === "new" ? "Add Application" : `Edit “${editing.name}”`}
          initial={editing === "new" ? EMPTY : toInput(editing)}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
