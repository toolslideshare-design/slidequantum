import "server-only";

import { readFile, writeFile, mkdir } from "fs/promises";
import type { HomepageContentData } from "@/types/content";
import { HOMEPAGE_FILE } from "./paths";

export async function getHomepageContent(): Promise<HomepageContentData> {
  const raw = await readFile(HOMEPAGE_FILE, "utf8");
  return JSON.parse(raw) as HomepageContentData;
}

export async function saveHomepageContent(data: HomepageContentData): Promise<void> {
  await mkdir(HOMEPAGE_FILE.replace(/[/\\][^/\\]+$/, ""), { recursive: true });
  await writeFile(HOMEPAGE_FILE, JSON.stringify(data, null, 2), "utf8");
}
