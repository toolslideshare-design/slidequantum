"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { ImageIcon, Save, Upload } from "lucide-react";
import type { FaviconSettings, SiteSettings } from "@/types/content";
import {
  submitAdminFormRequest,
  submitAdminJsonRequest,
} from "@/lib/admin-client";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminField, adminInputClassName } from "@/components/admin/admin-field";
import {
  AdminMessage,
  getAdminMessageVariant,
} from "@/components/admin/admin-message";
import { Button } from "@/components/ui/button";
export function SettingsEditor() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [favicon, setFavicon] = useState<FaviconSettings | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [faviconMessage, setFaviconMessage] = useState("");
  const [settingsIsError, setSettingsIsError] = useState(false);
  const [settingsStorageError, setSettingsStorageError] = useState(false);
  const [faviconIsError, setFaviconIsError] = useState(false);
  const [faviconStorageError, setFaviconStorageError] = useState(false);  const [saving, setSaving] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data: SiteSettings) => setSettings(data));
    fetch("/api/admin/favicon")
      .then((res) => res.json())
      .then((data: FaviconSettings) => setFavicon(data));
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setMessage("");

    const result = await submitAdminJsonRequest<{ success?: boolean }>({
      url: "/api/admin/settings",
      method: "PUT",
      body: settings,
      fallbackError: "Failed to save settings.",
    });

    setSaving(false);

    if (!result.ok) {
      setSettingsIsError(true);
      setSettingsStorageError(result.isStorageError);
      setMessage(result.error);
      return;
    }

    setSettingsIsError(false);
    setSettingsStorageError(false);
    setMessage("Site settings saved successfully.");
  }
  async function handleFaviconUpload() {
    if (!faviconFile) {
      setFaviconMessage("Please choose a .png, .ico, or .svg favicon first.");
      return;
    }

    setUploadingFavicon(true);
    setFaviconMessage("");

    const formData = new FormData();
    formData.append("favicon", faviconFile);

    const result = await submitAdminFormRequest<{ settings?: FaviconSettings }>({
      url: "/api/admin/favicon",
      formData,
      fallbackError: "Failed to upload favicon.",
    });

    setUploadingFavicon(false);

    if (!result.ok) {
      setFaviconIsError(true);
      setFaviconStorageError(result.isStorageError);
      setFaviconMessage(result.error);
      return;
    }

    if (!result.data.settings) {
      setFaviconIsError(true);
      setFaviconStorageError(false);
      setFaviconMessage("Failed to upload favicon.");
      return;
    }

    setFavicon(result.data.settings);
    setFaviconFile(null);
    setFaviconIsError(false);
    setFaviconStorageError(false);
    setFaviconMessage("Favicon uploaded successfully.");
  }
  function handleFaviconChange(event: ChangeEvent<HTMLInputElement>) {
    setFaviconFile(event.target.files?.[0] ?? null);
    setFaviconMessage("");
  }

  if (!settings) {
    return <p className="text-muted-foreground">Loading settings...</p>;
  }

  const input = adminInputClassName();
  const textarea = `${input} min-h-28 resize-y`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Update SEO metadata and site name used across the website.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="size-4" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {message && (
        <AdminMessage
          message={message}
          variant={getAdminMessageVariant({
            isError: settingsIsError,
            isStorageError: settingsStorageError,
          })}
        />
      )}
      <AdminCard title="SEO & Site Info">
        <div className="grid gap-4">
          <AdminField label="Site Name">
            <input className={input} value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} />
          </AdminField>
          <AdminField label="Meta Title">
            <input className={input} value={settings.metaTitle} onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })} />
          </AdminField>
          <AdminField label="Meta Description">
            <textarea className={textarea} value={settings.metaDescription} onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })} />
          </AdminField>
          <AdminField label="Keywords (comma separated)">
            <input
              className={input}
              value={settings.keywords.join(", ")}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean),
                })
              }
            />
          </AdminField>
          <AdminField label="Site URL">
            <input className={input} value={settings.url} onChange={(e) => setSettings({ ...settings, url: e.target.value })} />
          </AdminField>
        </div>
      </AdminCard>

      <AdminCard
        title="Favicon"
        description="Upload the browser tab and mobile bookmark icon for your website. Supported formats: .png, .ico, .svg."
      >
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
            <div className="flex h-28 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10">
              {favicon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${favicon.href}${favicon.updatedAt ? `?v=${encodeURIComponent(favicon.updatedAt)}` : ""}`}
                  alt="Current favicon preview"
                  className="size-16 rounded-lg object-contain"
                />
              ) : (
                <ImageIcon className="size-10 text-orange-400" />
              )}
            </div>
            <p className="mt-4 text-sm font-semibold">Current favicon</p>
            <p className="mt-1 break-all text-xs text-muted-foreground">
              {favicon?.href ?? "No favicon uploaded yet."}
            </p>
          </div>

          <div className="space-y-4">
            <AdminField label="Upload favicon file">
              <input
                type="file"
                accept=".png,.ico,.svg,image/png,image/x-icon,image/svg+xml"
                className={input}
                onChange={handleFaviconChange}
              />
            </AdminField>

            {faviconFile && (
              <p className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-muted-foreground">
                Selected file: {faviconFile.name}
              </p>
            )}

            {faviconMessage && (
              <AdminMessage
                message={faviconMessage}
                variant={getAdminMessageVariant({
                  isError: faviconIsError,
                  isStorageError: faviconStorageError,
                })}
              />
            )}
            <Button
              type="button"
              onClick={handleFaviconUpload}
              disabled={uploadingFavicon}
            >
              <Upload className="size-4" />
              {uploadingFavicon ? "Uploading..." : "Save Favicon"}
            </Button>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
