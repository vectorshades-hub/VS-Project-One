import {
  Building2,
  Calculator,
  CalendarClock,
  ChartColumn,
  ClipboardCheck,
  Database,
  FileText,
  FolderKanban,
  Globe,
  HardHat,
  LayoutGrid,
  Layers,
  Package,
  Ruler,
  Settings,
  ShieldCheck,
  Truck,
  UserCheck,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/** Icons the admin can choose from. Keys are stored in MongoDB. */
export const ICONS: Record<string, { label: string; Icon: LucideIcon }> = {
  "layout-grid": { label: "General", Icon: LayoutGrid },
  "calendar-clock": { label: "Schedule", Icon: CalendarClock },
  "user-check": { label: "Attendance", Icon: UserCheck },
  users: { label: "People", Icon: Users },
  layers: { label: "Rebar / Layers", Icon: Layers },
  calculator: { label: "Estimating", Icon: Calculator },
  "clipboard-check": { label: "QA / Review", Icon: ClipboardCheck },
  "shield-check": { label: "Quality / Safety", Icon: ShieldCheck },
  "hard-hat": { label: "Construction", Icon: HardHat },
  "building-2": { label: "Building", Icon: Building2 },
  ruler: { label: "Design / Drafting", Icon: Ruler },
  "folder-kanban": { label: "Projects", Icon: FolderKanban },
  "file-text": { label: "Documents", Icon: FileText },
  "chart-column": { label: "Reports", Icon: ChartColumn },
  package: { label: "Materials", Icon: Package },
  truck: { label: "Logistics", Icon: Truck },
  wrench: { label: "Tools", Icon: Wrench },
  database: { label: "Data", Icon: Database },
  settings: { label: "Settings", Icon: Settings },
  globe: { label: "Web", Icon: Globe },
};

export function AppIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (ICONS[name] ?? ICONS["layout-grid"]).Icon;
  return <Icon className={className} aria-hidden="true" strokeWidth={1.75} />;
}
