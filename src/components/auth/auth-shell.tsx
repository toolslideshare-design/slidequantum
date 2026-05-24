"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Download } from "lucide-react";
import { Container } from "@/components/ui/container";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerHref: string;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footerText,
  footerLinkText,
  footerHref,
}: AuthShellProps) {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-orange-500/20 blur-[120px]" />
      </div>
      <Container className="relative max-w-md px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card glow-border rounded-3xl p-8 shadow-[0_0_90px_-50px_rgba(249,115,22,0.95)] sm:p-10"
        >
          <div className="mb-8 text-center">
            <span className="mx-auto mb-5 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25">
              <Download className="size-6" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          {children}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {footerText}{" "}
            <Link
              href={footerHref}
              className="font-semibold text-orange-400 transition-colors hover:text-orange-300"
            >
              {footerLinkText}
            </Link>
          </p>
        </motion.div>
      </Container>
    </section>
  );
}
