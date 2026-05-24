"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[site] route error", error);
  }, [error]);

  return (
    <section className="flex min-h-[70vh] items-center pt-28 pb-20">
      <Container className="max-w-xl text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">
          Page error
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          This page could not load
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page ran into a temporary issue. You can retry or return to the
          homepage.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" onClick={() => reset()}>
            <RefreshCcw className="size-4" />
            Try again
          </Button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 px-5 text-sm font-semibold text-muted-foreground transition hover:border-orange-500/40 hover:text-orange-300"
          >
            Go home
          </Link>
        </div>
      </Container>
    </section>
  );
}
