import "server-only";

import type { SiteSettings } from "@/types/content";
import { SITE_SETTINGS_FILE } from "./paths";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { readJson, writeJson } from "@/lib/storage/json-store";

const defaultSettings: SiteSettings = {
  name: "SlideQuantum",
  metaTitle: "SlideQuantum – AI-Powered SlideShare Downloader",
  metaDescription:
    "Download SlideShare presentations as PPT and PDF with SlideQuantum. AI-powered summaries, notes, quizzes, and presentation tools.",
  keywords: [
    "slideshare downloader",
    "slidequantum",
    "download slideshare",
    "slideshare to pdf",
    "slideshare to ppt",
    "ppt downloader",
    "pdf downloader",
    "presentation downloader",
    "free slideshare download",
    "slideshare ppt download",
    "slideshare pdf download",
    "ai presentation tools",
  ],
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const settings = await readJson(STORAGE_KEYS.siteSettings, {
    filePath: SITE_SETTINGS_FILE,
    fallback: defaultSettings,
  });

  return {
    ...settings,
    url: process.env.NEXT_PUBLIC_SITE_URL ?? settings.url,
  };
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  await writeJson(STORAGE_KEYS.siteSettings, settings, {
    filePath: SITE_SETTINGS_FILE,
  });
}

export { defaultSettings };
