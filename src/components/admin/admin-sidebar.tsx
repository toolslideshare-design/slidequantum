"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import {
  BrainCircuit,
  Code2,
  FileText,
  Home,
  LayoutTemplate,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/homepage", label: "Homepage Editor", icon: Home },
  { href: "/admin/layout", label: "Layout Settings", icon: LayoutTemplate },
  { href: "/admin/blog", label: "Blog Manager", icon: FileText },
  { href: "/admin/head-code", label: "Head Code", icon: Code2 },
  { href: "/admin/body-code", label: "Body Code", icon: Code2 },
  { href: "/admin/ai-settings", label: "AI Settings", icon: BrainCircuit },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

type AdminSidebarProps = {
  onNavigate?: () => void;
};

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex w-full flex-col bg-black/40 p-4 backdrop-blur-xl sm:p-6 lg:h-full lg:w-64">
      <div className="mb-6 hidden lg:block">
        <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">
          Admin Panel
        </p>
        <h1 className="mt-1 text-lg font-bold">SlideQuantum</h1>
      </div>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Admin navigation">
        {navItems.map((item, index) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.035, duration: 0.28 }}
              whileHover={{ x: 4 }}
            >
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "relative flex min-h-11 items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
                  active
                    ? "bg-orange-500/15 text-orange-400 shadow-[0_0_20px_-10px_rgba(249,115,22,0.5)]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="admin-sidebar-active"
                    className="absolute inset-0 rounded-xl border border-orange-500/20 bg-orange-500/10"
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                  />
                )}
                <item.icon className="relative size-4" />
                <span className="relative">{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <Button
        variant="ghost"
        className="mt-4 w-full justify-start lg:mt-6"
        onClick={handleLogout}
      >
        <LogOut className="size-4" />
        Logout
      </Button>
    </aside>
  );
}
