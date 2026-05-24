import "server-only";

import type { AiSettings } from "@/types/content";
import { AI_SETTINGS_FILE } from "@/lib/data/paths";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { readJson, writeJson } from "@/lib/storage/json-store";

const defaultAiSettings: AiSettings = {
  geminiApiKey: "",
  updatedAt: null,
};

export async function getAiSettings(): Promise<AiSettings> {
  return readJson(STORAGE_KEYS.aiSettings, {
    filePath: AI_SETTINGS_FILE,
    fallback: defaultAiSettings,
  });
}

export async function saveAiSettings(geminiApiKey: string): Promise<AiSettings> {
  const settings: AiSettings = {
    geminiApiKey: geminiApiKey.trim(),
    updatedAt: new Date().toISOString(),
  };

  await writeJson(STORAGE_KEYS.aiSettings, settings, {
    filePath: AI_SETTINGS_FILE,
  });

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
