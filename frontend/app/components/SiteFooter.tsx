"use client";

import Link from "next/link";
import { APP_NAME } from "../lib/brand";

export function SiteFooter({ showAdminLink = false }: { showAdminLink?: boolean }) {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="flex w-full flex-col items-center justify-between gap-2 px-4 py-5 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-10">
        <p suppressHydrationWarning>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        {showAdminLink && (
          <Link href="/admin" className="hover:text-blue-900 hover:underline">
            Admin
          </Link>
        )}
      </div>
    </footer>
  );
}
