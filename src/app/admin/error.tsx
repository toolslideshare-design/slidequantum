"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] route error", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">
          Admin error
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Admin panel issue
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Something failed while loading this admin page.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" onClick={() => reset()}>
            <RefreshCcw className="size-4" />
            Retry
          </Button>
          <Link
            href="/admin"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 px-5 text-sm font-semibold text-muted-foreground transition hover:border-orange-500/40 hover:text-orange-300"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
