import { statusLabel, type AppStatus } from "../lib/types";

const STYLES: Record<AppStatus, string> = {
  available: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  coming_soon: "bg-amber-50 text-amber-800 ring-amber-600/20",
  maintenance: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export function StatusBadge({ status }: { status: AppStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STYLES[status]}`}>
      {statusLabel(status)}
    </span>
  );
}
