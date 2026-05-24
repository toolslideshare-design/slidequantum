"use client";

import { cn } from "@/lib/utils";

type AdminMessageProps = {
  message: string;
  variant?: "success" | "error" | "warning";
  className?: string;
};

const variantStyles = {
  success:
    "border-emerald-500/25 bg-emerald-500/10 text-emerald-100",
  error: "border-red-500/25 bg-red-500/10 text-red-100",
  warning: "border-amber-500/25 bg-amber-500/10 text-amber-100",
};

export function AdminMessage({
  message,
  variant = "success",
  className,
}: AdminMessageProps) {
  if (!message) return null;

  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        "rounded-xl border px-4 py-3 text-sm leading-relaxed",
        variantStyles[variant],
        className
      )}
    >
      {message}
    </p>
  );
}

export function getAdminMessageVariant(options: {
  isError: boolean;
  isStorageError?: boolean;
}): "success" | "error" | "warning" {
  if (!options.isError) return "success";
  return options.isStorageError ? "warning" : "error";
}
