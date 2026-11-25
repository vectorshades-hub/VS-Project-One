"use client";

import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { StatusBadge } from "../../components/StatusBadge";
import { AppIcon } from "../../lib/icons";
import type { AdminApp } from "../../lib/types";

type Props = {
  apps: AdminApp[];
  busyId: string | null;
  onEdit: (app: AdminApp) => void;
  onDelete: (app: AdminApp) => void;
  onToggle: (app: AdminApp) => void;
  onMove: (index: number, direction: -1 | 1) => void;
};

function Toggle({ app, disabled, onToggle }: { app: AdminApp; disabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={app.enabled}
      aria-label={`${app.enabled ? "Disable" : "Enable"} ${app.name}`}
      disabled={disabled}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full disabled:opacity-50 ${
        app.enabled ? "bg-blue-900" : "bg-slate-300"
      }`}
    >
      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow ${app.enabled ? "translate-x-5.5" : "translate-x-0.5"}`} />
    </button>
  );
}

const iconBtn = "rounded-md p-1.5 disabled:cursor-not-allowed disabled:opacity-30";

export function ApplicationList({ apps, busyId, onEdit, onDelete, onToggle, onMove }: Props) {
  if (apps.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
        No applications yet. Click “Add Application” to create one.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {apps.map((app, index) => {
        const busy = busyId === app.id;
        return (
          <li key={app.id} className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center ${app.enabled ? "" : "bg-slate-50"}`}>
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <div className="flex flex-col">
                <button className={`${iconBtn} text-slate-400 hover:bg-slate-100`} disabled={index === 0 || busyId !== null} onClick={() => onMove(index, -1)} aria-label={`Move ${app.name} up`}>
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  className={`${iconBtn} text-slate-400 hover:bg-slate-100`}
                  disabled={index === apps.length - 1 || busyId !== null}
                  onClick={() => onMove(index, 1)}
                  aria-label={`Move ${app.name} down`}
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${app.enabled ? "bg-blue-50 text-blue-900" : "bg-slate-200 text-slate-400"}`}>
                <AppIcon name={app.icon} className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`font-medium ${app.enabled ? "text-slate-900" : "text-slate-500"}`}>{app.name}</span>
                  <StatusBadge status={app.status} />
                  {!app.enabled && <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">Hidden</span>}
                </div>
                {app.description && <p className="mt-0.5 text-sm text-slate-500">{app.description}</p>}
                <p className="mt-0.5 truncate text-xs text-slate-400">{app.url || "No URL"}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pl-11 sm:pl-0">
              <label className="flex items-center gap-2 text-xs text-slate-500">
                <Toggle app={app} disabled={busy} onToggle={() => onToggle(app)} />
                <span className="w-12">{app.enabled ? "Enabled" : "Disabled"}</span>
              </label>
              <button className={`${iconBtn} text-blue-900 hover:bg-blue-50`} onClick={() => onEdit(app)} disabled={busy} aria-label={`Edit ${app.name}`} title="Edit">
                <Pencil className="h-4 w-4" />
              </button>
              <button className={`${iconBtn} text-red-600 hover:bg-red-50`} onClick={() => onDelete(app)} disabled={busy} aria-label={`Delete ${app.name}`} title="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
