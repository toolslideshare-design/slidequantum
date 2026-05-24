"use client";

import { Eye, EyeOff, KeyRound, Save, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminField, adminInputClassName } from "@/components/admin/admin-field";
import { Button } from "@/components/ui/button";

type AiSettingsResponse = {
  hasGeminiApiKey: boolean;
  geminiApiKeyPreview: string;
  updatedAt: string | null;
};

export function AiSettingsEditor() {
  const [settings, setSettings] = useState<AiSettingsResponse | null>(null);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/ai-settings")
      .then((response) => response.json())
      .then((data: AiSettingsResponse) => setSettings(data));
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage("");

    const response = await fetch("/api/admin/ai-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ geminiApiKey }),
    });
    const data = (await response.json()) as {
      settings?: AiSettingsResponse;
      error?: string;
    };

    setSaving(false);

    if (!response.ok || !data.settings) {
      setMessage(data.error ?? "Failed to save AI settings.");
      return;
    }

    setSettings(data.settings);
    setGeminiApiKey("");
    setMessage("AI settings saved successfully.");
  }

  if (!settings) {
    return <p className="text-muted-foreground">Loading AI settings...</p>;
  }

  const input = adminInputClassName();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm text-orange-300">
            <Sparkles className="size-4" />
            AI System
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight">AI Settings</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Store your Gemini API key securely for AI Summary, AI Notes, and future AI tools.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="size-4" />
          {saving ? "Saving..." : "Save AI Settings"}
        </Button>
      </div>

      {message && (
        <p className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm text-orange-200">
          {message}
        </p>
      )}

      <AdminCard
        title="Gemini API Key"
        description="This key is stored server-side only and is never sent to the frontend."
      >
        <div className="grid gap-5">
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-muted-foreground">
            Current key:{" "}
            <span className="font-semibold text-orange-200">
              {settings.hasGeminiApiKey
                ? settings.geminiApiKeyPreview
                : "No Gemini API key saved yet."}
            </span>
          </div>

          <AdminField label="Gemini API Key">
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-3.5 size-4 text-orange-400" />
              <input
                type={showKey ? "text" : "password"}
                value={geminiApiKey}
                onChange={(event) => setGeminiApiKey(event.target.value)}
                className={`${input} pr-12 pl-10`}
                placeholder="Paste your Gemini API key here"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowKey((current) => !current)}
                className="absolute right-3 top-3.5 text-muted-foreground transition-colors hover:text-orange-300"
                aria-label={showKey ? "Hide API key" : "Show API key"}
              >
                {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </AdminField>

          <p className="text-sm text-muted-foreground">
            Leave this field blank and save only if you want to remove the current key.
          </p>
        </div>
      </AdminCard>
    </div>
  );
}
