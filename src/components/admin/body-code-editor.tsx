"use client";

import { useEffect, useState } from "react";
import { Code2, Save } from "lucide-react";
import type { BodyCodeSettings } from "@/types/content";
import { submitAdminJsonRequest } from "@/lib/admin-client";
import { AdminCard } from "@/components/admin/admin-card";
import { adminInputClassName } from "@/components/admin/admin-field";
import {
  AdminMessage,
  getAdminMessageVariant,
} from "@/components/admin/admin-message";
import { Button } from "@/components/ui/button";

export function BodyCodeEditor() {
  const [settings, setSettings] = useState<BodyCodeSettings | null>(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isStorageError, setIsStorageError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/body-code")
      .then((response) => response.json())
      .then((data: BodyCodeSettings) => setSettings(data));
  }, []);

  async function handleSave() {
    if (!settings) return;

    setSaving(true);
    setMessage("");

    const result = await submitAdminJsonRequest<{
      settings?: BodyCodeSettings;
    }>({
      url: "/api/admin/body-code",
      method: "PUT",
      body: { code: settings.code },
      fallbackError: "Failed to save body code.",
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
      setMessage("Failed to save body code.");
      return;
    }

    setSettings(result.data.settings);
    setIsError(false);
    setIsStorageError(false);
    setMessage("Body code saved successfully.");
  }

  if (!settings) {
    return <p className="text-muted-foreground">Loading body code...</p>;
  }

  const textareaClassName = `${adminInputClassName()} min-h-[420px] resize-y font-mono text-xs leading-relaxed sm:text-sm`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm text-orange-300">
            <Code2 className="size-4" />
            Custom Body Code
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight">Body Code</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Paste custom HTML/scripts that will load before the closing
            {" </body> "}tag.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="size-4" />
          {saving ? "Saving..." : "Save Body Code"}
        </Button>
      </div>

      <AdminMessage
        message={message}
        variant={getAdminMessageVariant({ isError, isStorageError })}
      />

      <AdminCard
        title="Website Body Injection"
        description="Add chat widgets, tracking scripts, popup scripts, marketing tools, analytics snippets, or any custom HTML that should load before the closing body tag."
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
          placeholder={`<!-- Paste custom body code here -->\n<script>\n  console.log("Loaded before closing body tag");\n</script>`}
          aria-label="Custom body code"
        />

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-muted-foreground">
          This code is rendered server-side just before the closing body tag and
          loads on all public and admin pages after refresh.
        </div>
      </AdminCard>
    </div>
  );
}
