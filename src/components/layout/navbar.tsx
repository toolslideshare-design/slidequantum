"use client";

import { ChevronDown, Download, LogOut, Menu, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import type { LayoutSettings, PublicUser } from "@/types/content";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

type NavbarProps = {
  header: LayoutSettings["header"];
  user: PublicUser | null;
};

export function Navbar({ header, user }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const headerBackground = useTransform(
    scrollY,
    [0, 80],
    ["rgba(5,5,5,0.74)", "rgba(5,5,5,0.9)"]
  );

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUserOpen(false);
    router.push("/");
    router.refresh();
  }

  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "U";

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 border-b border-white/5 backdrop-blur-xl"
      style={{ backgroundColor: headerBackground }}
    >
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-2.5 font-bold tracking-tight transition-opacity hover:opacity-90"
        >
          <motion.span
            whileHover={{ rotate: -6, scale: 1.06 }}
            transition={{ type: "spring", stiffness: 320, damping: 18 }}
            className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25"
          >
            <Download className="size-5" />
          </motion.span>
          <span className="hidden text-lg sm:inline">{header.logoText}</span>
        </Link>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Main navigation"
        >
          {header.navigationLinks.map((item) => {
            const active = pathname === item.href;

            return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative text-sm font-medium transition-all duration-300 hover:text-orange-400",
                active ? "text-orange-300" : "text-muted-foreground"
              )}
            >
              {item.label}
              <span className="absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-orange-500 to-amber-400 transition-transform duration-300 group-hover:scale-x-100" />
              {active && (
                <motion.span
                  layoutId="navbar-active-link"
                  className="absolute -bottom-2 left-0 h-px w-full bg-gradient-to-r from-orange-500 to-amber-400"
                />
              )}
            </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setUserOpen((open) => !open)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-sm font-semibold transition-all hover:border-orange-500/40 hover:text-orange-400"
                aria-expanded={userOpen}
              >
                <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-xs text-white">
                  {userInitial}
                </span>
                <span className="max-w-28 truncate">{user.name}</span>
                <motion.span animate={{ rotate: userOpen ? 180 : 0 }}>
                  <ChevronDown className="size-4" />
                </motion.span>
              </button>

              <AnimatePresence>
                {userOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 320, damping: 26 }}
                    className="absolute right-0 mt-3 w-48 overflow-hidden rounded-2xl border border-white/10 bg-black/90 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl"
                  >
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-orange-400"
                      onClick={() => setUserOpen(false)}
                    >
                      <User className="size-4" />
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-orange-400"
                    >
                      <LogOut className="size-4" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-muted-foreground transition-all hover:border-orange-500/50 hover:text-orange-400 sm:inline-flex"
            >
              {header.loginButtonText}
            </Link>
          )}
          <Link
            href="/"
            className="btn-glow pulse-glow hidden items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold sm:inline-flex"
          >
            {header.ctaButtonText}
          </Link>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-white/5 md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mobileOpen ? "close" : "menu"}
                initial={{ rotate: -45, opacity: 0, scale: 0.8 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 45, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.18 }}
              >
                {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-white/5 bg-background/95 md:hidden"
          >
            <Container className="flex flex-col gap-1 py-4">
              {header.navigationLinks.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.035 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "block min-h-11 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground",
                      "transition-colors hover:bg-white/5 hover:text-orange-400"
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-orange-400"
                    onClick={() => setMobileOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Button
                    variant="ghost"
                    className="mt-2 w-full"
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-orange-400"
                  onClick={() => setMobileOpen(false)}
                >
                  {header.loginButtonText}
                </Link>
              )}
              <Link
                href="/"
                className="btn-glow mt-2 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold"
                onClick={() => setMobileOpen(false)}
              >
                {header.ctaButtonText}
              </Link>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
