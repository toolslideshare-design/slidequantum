import "server-only";

import { readFile, writeFile, mkdir } from "fs/promises";
import type { SiteSettings } from "@/types/content";
import { SITE_SETTINGS_FILE } from "./paths";

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
  try {
    const raw = await readFile(SITE_SETTINGS_FILE, "utf8");
    return JSON.parse(raw) as SiteSettings;
  } catch {
    return defaultSettings;
  }
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  await mkdir(SITE_SETTINGS_FILE.replace(/[/\\][^/\\]+$/, ""), {
    recursive: true,
  });
  await writeFile(SITE_SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf8");
}

export { defaultSettings };
