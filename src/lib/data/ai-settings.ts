import "server-only";

import { mkdir, readFile, writeFile } from "fs/promises";
import type { AiSettings } from "@/types/content";
import { AI_SETTINGS_FILE } from "@/lib/data/paths";

const defaultAiSettings: AiSettings = {
  geminiApiKey: "",
  updatedAt: null,
};

export async function getAiSettings(): Promise<AiSettings> {
  try {
    const raw = await readFile(AI_SETTINGS_FILE, "utf8");
    return JSON.parse(raw) as AiSettings;
  } catch {
    return defaultAiSettings;
  }
}

export async function saveAiSettings(geminiApiKey: string): Promise<AiSettings> {
  const settings: AiSettings = {
    geminiApiKey: geminiApiKey.trim(),
    updatedAt: new Date().toISOString(),
  };

  await mkdir(AI_SETTINGS_FILE.replace(/[/\\][^/\\]+$/, ""), {
    recursive: true,
  });
  await writeFile(AI_SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf8");

  return settings;
}

export function maskGeminiKey(settings: AiSettings) {
  return {
    hasGeminiApiKey: Boolean(settings.geminiApiKey),
    geminiApiKeyPreview: settings.geminiApiKey
      ? `${settings.geminiApiKey.slice(0, 6)}...${settings.geminiApiKey.slice(-4)}`
      : "",
    updatedAt: settings.updatedAt,
  };
}

export { defaultAiSettings };
