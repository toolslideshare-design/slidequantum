import "server-only";

import { mkdir, readFile, writeFile } from "fs/promises";
import type { BodyCodeSettings } from "@/types/content";
import { BODY_CODE_FILE } from "@/lib/data/paths";

const defaultBodyCode: BodyCodeSettings = {
  code: "",
  updatedAt: null,
};

export async function getBodyCode(): Promise<BodyCodeSettings> {
  try {
    const raw = await readFile(BODY_CODE_FILE, "utf8");
    return JSON.parse(raw) as BodyCodeSettings;
  } catch {
    return defaultBodyCode;
  }
}

export async function saveBodyCode(code: string): Promise<BodyCodeSettings> {
  const settings: BodyCodeSettings = {
    code,
    updatedAt: new Date().toISOString(),
  };

  await mkdir(BODY_CODE_FILE.replace(/[/\\][^/\\]+$/, ""), {
    recursive: true,
  });
  await writeFile(BODY_CODE_FILE, JSON.stringify(settings, null, 2), "utf8");

  return settings;
}

export { defaultBodyCode };
