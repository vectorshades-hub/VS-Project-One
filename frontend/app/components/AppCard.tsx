import { ExternalLink } from "lucide-react";
import { AppIcon } from "../lib/icons";
import { statusLabel, type DashboardApp } from "../lib/types";
import { StatusBadge } from "./StatusBadge";

/**
 * Per-card color themes. Class names are written out in full so Tailwind can
 * detect them at build time. Cards cycle through these by their position.
 */
const THEMES = [
  {
    card: "bg-blue-50 border-blue-200",
    icon: "bg-blue-600 text-white",
    button: "bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-500",
  },
  {
    card: "bg-emerald-50 border-emerald-200",
    icon: "bg-emerald-600 text-white",
    button: "bg-emerald-700 hover:bg-emerald-800 focus-visible:ring-emerald-500",
  },
  {
    card: "bg-amber-50 border-amber-200",
    icon: "bg-amber-500 text-white",
    button: "bg-amber-700 hover:bg-amber-800 focus-visible:ring-amber-500",
  },
  {
    card: "bg-violet-50 border-violet-200",
    icon: "bg-violet-600 text-white",
    button: "bg-violet-700 hover:bg-violet-800 focus-visible:ring-violet-500",
  },
  {
    card: "bg-rose-50 border-rose-200",
    icon: "bg-rose-600 text-white",
    button: "bg-rose-700 hover:bg-rose-800 focus-visible:ring-rose-500",
  },
  {
    card: "bg-cyan-50 border-cyan-200",
    icon: "bg-cyan-600 text-white",
    button: "bg-cyan-700 hover:bg-cyan-800 focus-visible:ring-cyan-500",
  },
] as const;

export function AppCard({ app, index = 0 }: { app: DashboardApp; index?: number }) {
  const available = app.status === "available" && Boolean(app.url);
  const theme = THEMES[index % THEMES.length];

  return (
    <article
      className={`flex h-full flex-col rounded-xl border p-6 shadow-sm ${
        available ? `${theme.card} hover:shadow-md` : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
            available ? theme.icon : "bg-slate-200 text-slate-400"
          }`}
        >
          <AppIcon name={app.icon} className="h-6 w-6" />
        </div>
        {!available && <StatusBadge status={app.status} />}
      </div>

      <h2 className={`mt-4 text-lg font-semibold ${available ? "text-slate-900" : "text-slate-500"}`}>{app.name}</h2>
      {app.description && <p className="mt-1 text-sm leading-relaxed text-slate-600">{app.description}</p>}

      <div className="mt-auto pt-6">
        {available ? (
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${theme.button}`}
          >
            Open Application
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg bg-slate-200 px-4 py-2.5 text-sm font-medium text-slate-500"
          >
            {statusLabel(app.status)}
          </button>
        )}
      </div>
    </article>
  );
}
