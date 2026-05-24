import "server-only";

import type { HeadCodeSettings } from "@/types/content";
import { HEAD_CODE_FILE } from "@/lib/data/paths";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { readJson, writeJson } from "@/lib/storage/json-store";

const defaultHeadCode: HeadCodeSettings = {
  code: "",
  updatedAt: null,
};

export async function getHeadCode(): Promise<HeadCodeSettings> {
  return readJson(STORAGE_KEYS.headCode, {
    filePath: HEAD_CODE_FILE,
    fallback: defaultHeadCode,
  });
}

export async function saveHeadCode(code: string): Promise<HeadCodeSettings> {
  const settings: HeadCodeSettings = {
    code,
    updatedAt: new Date().toISOString(),
  };

  await writeJson(STORAGE_KEYS.headCode, settings, {
    filePath: HEAD_CODE_FILE,
  });

  return settings;
}

export { defaultHeadCode };
