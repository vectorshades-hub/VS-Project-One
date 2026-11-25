"use client";

import { useCallback, useEffect, useState } from "react";
import { AppCard } from "./components/AppCard";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { api } from "./lib/api";
import { APP_NAME } from "./lib/brand";
import type { DashboardApp } from "./lib/types";

const REFRESH_MS = 60_000;

export default function DashboardPage() {
  const [apps, setApps] = useState<DashboardApp[] | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setApps(await api<DashboardApp[]>("/applications"));
      setError("");
    } catch {
      setError("Unable to load applications. Please try again shortly.");
    }
  }, []);

  // Load now, then keep in sync with admin changes (periodically and when the tab regains focus).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
    load();
    const timer = setInterval(load, REFRESH_MS);
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader subtitle="Application Portal" />

      <section className="border-b border-slate-200 bg-white">
        <div className="w-full px-4 py-8 sm:px-6 lg:px-10 sm:py-10">
          <h1 className="text-3xl font-bold tracking-tight text-blue-950 sm:text-4xl">{APP_NAME}</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Central access to the company&apos;s engineering and project management applications.
          </p>
        </div>
      </section>

      <main className="w-full flex-1 px-4 py-8 sm:px-6 lg:px-10 sm:py-10">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-slate-500">Applications</h2>

        {error && (
          <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {apps === null && !error && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 rounded-xl border border-slate-200 bg-white" />
            ))}
          </div>
        )}

        {apps?.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            No applications are available yet.
          </p>
        )}

        {apps && apps.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {apps.map((app, i) => (
              <AppCard key={app.id} app={app} index={i} />
            ))}
          </div>
        )}
      </main>

      <SiteFooter showAdminLink />
    </div>
  );
}
