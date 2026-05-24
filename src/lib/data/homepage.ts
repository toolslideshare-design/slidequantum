import "server-only";

import { readFile } from "fs/promises";
import type { HomepageContentData } from "@/types/content";
import { HOMEPAGE_FILE } from "./paths";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { readJson, writeJson } from "@/lib/storage/json-store";

async function getBundledHomepageContent(): Promise<HomepageContentData> {
  const raw = await readFile(HOMEPAGE_FILE, "utf8");
  return JSON.parse(raw) as HomepageContentData;
}

export async function getHomepageContent(): Promise<HomepageContentData> {
  return readJson(STORAGE_KEYS.homepageContent, {
    filePath: HOMEPAGE_FILE,
    fallback: await getBundledHomepageContent(),
  });
}

export async function saveHomepageContent(data: HomepageContentData): Promise<void> {
  await writeJson(STORAGE_KEYS.homepageContent, data, {
    filePath: HOMEPAGE_FILE,
  });
}
