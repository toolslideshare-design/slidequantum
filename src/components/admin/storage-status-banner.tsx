"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Database } from "lucide-react";
import { AdminMessage } from "@/components/admin/admin-message";

type StorageStatusResponse = {
  environment: "local" | "vercel";
  mode: "filesystem" | "kv" | "read-only";
  writable: boolean;
  kvConfigured: boolean;
  kvConnected: boolean;
  message: string;
};

export function StorageStatusBanner() {
  const [status, setStatus] = useState<StorageStatusResponse | null>(null);

  useEffect(() => {
    fetch("/api/admin/storage-status")
      .then((response) => response.json())
      .then((data: StorageStatusResponse) => setStatus(data))
      .catch(() => {
        setStatus(null);
      });
  }, []);

  if (!status) return null;

  if (status.environment === "local") {
    return (
      <AdminMessage
        variant="success"
        message={`${status.message} Admin saves write to local JSON files.`}
        className="mb-6"
      />
    );
  }

  if (status.mode === "kv" && status.kvConnected) {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
        <div>
          <p className="font-medium">Production KV storage connected</p>
          <p className="mt-1 text-emerald-100/90">{status.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <div>
        <p className="font-medium">Production storage not ready</p>
        <p className="mt-1 text-amber-100/90">{status.message}</p>
        <p className="mt-2 flex items-center gap-2 text-xs text-amber-100/80">
          <Database className="size-3.5" />
          Vercel → Storage → Upstash Redis → Connect → Redeploy
        </p>
      </div>
    </div>
  );
}
