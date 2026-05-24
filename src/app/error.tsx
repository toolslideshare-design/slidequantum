"use client";

import { useEffect } from "react";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] unhandled error", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#050505] text-white antialiased">
        <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">
            Something went wrong
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            We hit an unexpected error
          </h1>
          <p className="mt-3 text-sm text-zinc-400">
            Please try again. If the issue continues, restart the app with a clean
            dev build.
          </p>
          <Button type="button" className="mt-6" onClick={() => reset()}>
            <RefreshCcw className="size-4" />
            Try again
          </Button>
        </main>
      </body>
    </html>
  );
}
