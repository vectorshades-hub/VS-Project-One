export type AppStatus = "available" | "coming_soon" | "maintenance";

/** Application as shown on the public dashboard. */
export interface DashboardApp {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  status: AppStatus;
}

/** Application as managed in the admin panel. */
export interface AdminApp extends DashboardApp {
  enabled: boolean;
  order: number;
  updatedAt?: string;
}

export type AppInput = Omit<AdminApp, "id" | "updatedAt">;

export const STATUS_OPTIONS: { value: AppStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "coming_soon", label: "Coming Soon" },
  { value: "maintenance", label: "Under Maintenance" },
];

export function statusLabel(status: AppStatus) {
  return STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;
}
