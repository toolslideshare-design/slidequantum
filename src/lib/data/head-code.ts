import "server-only";

import { mkdir, readFile, writeFile } from "fs/promises";
import type { HeadCodeSettings } from "@/types/content";
import { HEAD_CODE_FILE } from "@/lib/data/paths";

const defaultHeadCode: HeadCodeSettings = {
  code: "",
  updatedAt: null,
};

export async function getHeadCode(): Promise<HeadCodeSettings> {
  try {
    const raw = await readFile(HEAD_CODE_FILE, "utf8");
    return JSON.parse(raw) as HeadCodeSettings;
  } catch {
    return defaultHeadCode;
  }
}

export async function saveHeadCode(code: string): Promise<HeadCodeSettings> {
  const settings: HeadCodeSettings = {
    code,
    updatedAt: new Date().toISOString(),
  };

  await mkdir(HEAD_CODE_FILE.replace(/[/\\][^/\\]+$/, ""), {
    recursive: true,
  });
  await writeFile(HEAD_CODE_FILE, JSON.stringify(settings, null, 2), "utf8");

  return settings;
}

export { defaultHeadCode };
