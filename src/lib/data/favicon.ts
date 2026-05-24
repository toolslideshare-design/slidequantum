import "server-only";

import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { FaviconSettings } from "@/types/content";
import { FAVICON_SETTINGS_FILE } from "@/lib/data/paths";

const defaultFaviconSettings: FaviconSettings = {
  href: "/favicon.svg",
  fileName: "favicon.svg",
  contentType: "image/svg+xml",
  updatedAt: null,
};

const extensionToContentType: Record<string, string> = {
  ico: "image/x-icon",
  png: "image/png",
  svg: "image/svg+xml",
};

export function getFaviconContentType(extension: string): string | null {
  return extensionToContentType[extension.toLowerCase()] ?? null;
}

export async function getFaviconSettings(): Promise<FaviconSettings> {
  try {
    const raw = await readFile(FAVICON_SETTINGS_FILE, "utf8");
    return JSON.parse(raw) as FaviconSettings;
  } catch {
    return defaultFaviconSettings;
  }
}

export async function saveFaviconSettings({
  fileName,
  contentType,
}: {
  fileName: string;
  contentType: string;
}): Promise<FaviconSettings> {
  const settings: FaviconSettings = {
    href: `/${fileName}`,
    fileName,
    contentType,
    updatedAt: new Date().toISOString(),
  };

  await mkdir(path.dirname(FAVICON_SETTINGS_FILE), { recursive: true });
  await writeFile(
    FAVICON_SETTINGS_FILE,
    JSON.stringify(settings, null, 2),
    "utf8"
  );

  return settings;
}

export { defaultFaviconSettings };
