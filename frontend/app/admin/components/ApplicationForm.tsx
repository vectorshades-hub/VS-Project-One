"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ICONS } from "../../lib/icons";
import { STATUS_OPTIONS, type AppInput, type AppStatus } from "../../lib/types";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100";

export function ApplicationForm({
  title,
  initial,
  onSave,
  onClose,
}: {
  title: string;
  initial: AppInput;
  onSave: (input: AppInput) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<AppInput>(initial);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof AppInput>(key: K, value: AppInput[K]) => setForm((f) => ({ ...f, [key]: value }));
  const urlRequired = form.status === "available";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSave(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-form-title"
    >
      <form onSubmit={submit} className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 id="app-form-title" className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
            Application name *
            <input className={inputClass} value={form.name} maxLength={100} required onChange={(e) => set("name", e.target.value)} />
          </label>

          <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
            Description
            <textarea
              className={`${inputClass} resize-y`}
              rows={2}
              maxLength={300}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
            URL {urlRequired && "*"}
            <input
              className={inputClass}
              value={form.url}
              required={urlRequired}
              placeholder="http://192.168.3.13:5005"
              onChange={(e) => set("url", e.target.value)}
            />
            {!urlRequired && <span className="mt-1 block text-xs font-normal text-slate-500">Optional while the application is not available.</span>}
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Status
            <select className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value as AppStatus)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <div className="text-sm font-medium text-slate-700">
            Visibility
            <label className="mt-1 flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 font-normal">
              <input
                type="checkbox"
                className="h-4 w-4 accent-blue-900"
                checked={form.enabled}
                onChange={(e) => set("enabled", e.target.checked)}
              />
              Enabled (shown on dashboard)
            </label>
          </div>

          <fieldset className="sm:col-span-2">
            <legend className="text-sm font-medium text-slate-700">Icon</legend>
            <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-5">
              {Object.entries(ICONS).map(([key, { label, Icon }]) => {
                const selected = form.icon === key;
                return (
                  <button
                    key={key}
                    type="button"
                    title={label}
                    aria-pressed={selected}
                    onClick={() => set("icon", key)}
                    className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[11px] leading-tight ${
                      selected ? "border-blue-900 bg-blue-50 text-blue-900" : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span className="text-center">{label}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        {error && (
          <p role="alert" className="mx-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
