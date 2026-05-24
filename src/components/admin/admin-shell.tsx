"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { cn } from "@/lib/utils";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-3 lg:hidden">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">
            Admin Panel
          </p>
          <p className="text-sm font-semibold">SlideQuantum</p>
        </div>
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-xl border border-white/10 text-foreground transition hover:border-orange-500/40"
          onClick={() => setMobileNavOpen((open) => !open)}
          aria-expanded={mobileNavOpen}
          aria-label="Toggle admin navigation"
        >
          {mobileNavOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div className="flex min-h-[calc(100vh-57px)] flex-col lg:min-h-screen lg:flex-row">
        <div
          className={cn(
            "border-b border-white/10 lg:block lg:border-b-0 lg:border-r",
            mobileNavOpen ? "block" : "hidden lg:block"
          )}
        >
          <AdminSidebar onNavigate={() => setMobileNavOpen(false)} />
        </div>
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}
