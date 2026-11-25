import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "../lib/brand";

export function SiteHeader({ subtitle, children }: { subtitle?: string; children?: React.ReactNode }) {
  return (
    <header className="border-b-4 border-red-600 bg-white shadow-sm">
      <div className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-4">
          <Image
            src="/Logo/vectorshades-project-one.png"
            alt={APP_NAME}
            width={1400}
            height={477}
            priority
            className="h-12 w-auto sm:h-14"
          />
          {subtitle && (
            <span className="hidden border-l border-slate-300 pl-4 text-sm font-medium text-slate-500 sm:block">
              {subtitle}
            </span>
          )}
        </Link>
        {children && <nav className="flex items-center gap-2">{children}</nav>}
      </div>
    </header>
  );
}
