import "server-only";

import type { BodyCodeSettings } from "@/types/content";
import { BODY_CODE_FILE } from "@/lib/data/paths";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { readJson, writeJson } from "@/lib/storage/json-store";

const defaultBodyCode: BodyCodeSettings = {
  code: "",
  updatedAt: null,
};

export async function getBodyCode(): Promise<BodyCodeSettings> {
  return readJson(STORAGE_KEYS.bodyCode, {
    filePath: BODY_CODE_FILE,
    fallback: defaultBodyCode,
  });
}

export async function saveBodyCode(code: string): Promise<BodyCodeSettings> {
  const settings: BodyCodeSettings = {
    code,
    updatedAt: new Date().toISOString(),
  };

  await writeJson(STORAGE_KEYS.bodyCode, settings, {
    filePath: BODY_CODE_FILE,
  });

  return settings;
}

export { defaultBodyCode };
