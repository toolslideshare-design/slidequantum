"use client";

import { useEffect, useState } from "react";
import { Code2, Save } from "lucide-react";
import type { HeadCodeSettings } from "@/types/content";
import { submitAdminJsonRequest } from "@/lib/admin-client";
import { AdminCard } from "@/components/admin/admin-card";
import { adminInputClassName } from "@/components/admin/admin-field";
import {
  AdminMessage,
  getAdminMessageVariant,
} from "@/components/admin/admin-message";
import { Button } from "@/components/ui/button";

export function HeadCodeEditor() {
  const [settings, setSettings] = useState<HeadCodeSettings | null>(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isStorageError, setIsStorageError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/head-code")
      .then((response) => response.json())
      .then((data: HeadCodeSettings) => setSettings(data));
  }, []);

  async function handleSave() {
    if (!settings) return;

    setSaving(true);
    setMessage("");

    const result = await submitAdminJsonRequest<{
      success?: boolean;
      settings?: HeadCodeSettings;
    }>({
      url: "/api/admin/head-code",
      method: "PUT",
      body: { code: settings.code },
      fallbackError: "Failed to save head code.",
    });

    setSaving(false);

    if (!result.ok) {
      setIsError(true);
      setIsStorageError(result.isStorageError);
      setMessage(result.error);
      return;
    }

    if (!result.data.settings) {
      setIsError(true);
      setIsStorageError(false);
      setMessage("Failed to save head code.");
      return;
    }

    setSettings(result.data.settings);
    setIsError(false);
    setIsStorageError(false);
    setMessage("Head code saved successfully.");
  }

  if (!settings) {
    return <p className="text-muted-foreground">Loading head code...</p>;
  }

  const textareaClassName = `${adminInputClassName()} min-h-[420px] resize-y font-mono text-xs leading-relaxed sm:text-sm`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm text-orange-300">
            <Code2 className="size-4" />
            Custom Head Code
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight">Head Code</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Paste custom HTML code that will be injected inside the website
            {" <head> "}tag.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="size-4" />
          {saving ? "Saving..." : "Save Head Code"}
        </Button>
      </div>

      <AdminMessage
        message={message}
        variant={getAdminMessageVariant({ isError, isStorageError })}
      />

      <AdminCard
        title="Website Head Injection"
        description="Add Google AdSense verification, Google Analytics, Meta verification tags, Facebook Pixel, SEO verification tags, or custom tracking scripts."
      >
        <textarea
          className={textareaClassName}
          value={settings.code}
          onChange={(event) =>
            setSettings((current) =>
              current ? { ...current, code: event.target.value } : current
            )
          }
          spellCheck={false}
          placeholder={`<!-- Paste custom <head> code here -->\n<meta name="google-site-verification" content="your-code" />\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>`}
          aria-label="Custom head code"
        />

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-muted-foreground">
          This code is rendered server-side inside the global website head and
          loads on all public and admin pages after refresh.
        </div>
      </AdminCard>
    </div>
  );
}
