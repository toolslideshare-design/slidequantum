import "server-only";

import type { FaviconSettings } from "@/types/content";
import { FAVICON_SETTINGS_FILE } from "@/lib/data/paths";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import {
  readJson,
  writeJson,
} from "@/lib/storage/json-store";

const defaultFaviconSettings: FaviconSettings = {
  href: "/favicon.svg",
  fileName: "favicon.svg",
  contentType: "image/svg+xml",
  updatedAt: null,
  dataBase64: null,
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
  return readJson(STORAGE_KEYS.favicon, {
    filePath: FAVICON_SETTINGS_FILE,
    fallback: defaultFaviconSettings,
  });
}

export async function saveFaviconSettings({
  fileName,
  contentType,
  dataBase64 = null,
}: {
  fileName: string;
  contentType: string;
  dataBase64?: string | null;
}): Promise<FaviconSettings> {
  const settings: FaviconSettings = {
    href: dataBase64 ? "/api/favicon" : `/${fileName}`,
    fileName,
    contentType,
    updatedAt: new Date().toISOString(),
    dataBase64,
  };

  await writeJson(STORAGE_KEYS.favicon, settings, {
    filePath: FAVICON_SETTINGS_FILE,
  });

  return settings;
}

export { defaultFaviconSettings };
