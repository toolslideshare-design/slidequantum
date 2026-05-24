import "server-only";

import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import type { DownloadHistoryItem, SavedPresentation } from "@/types/content";
import {
  DOWNLOAD_HISTORY_FILE,
  SAVED_PRESENTATIONS_FILE,
} from "@/lib/data/paths";

type NewDownloadHistoryItem = {
  title: string;
  slideshareUrl: string;
  format: "PDF" | "PPT";
  downloadUrl?: string;
};

type NewSavedPresentation = {
  title: string;
  slideshareUrl: string;
  thumbnailUrl: string;
};

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await mkdir(filePath.replace(/[/\\][^/\\]+$/, ""), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

async function readDownloadHistory(): Promise<DownloadHistoryItem[]> {
  return readJsonFile<DownloadHistoryItem[]>(DOWNLOAD_HISTORY_FILE, []);
}

async function writeDownloadHistory(items: DownloadHistoryItem[]): Promise<void> {
  await writeJsonFile(DOWNLOAD_HISTORY_FILE, items);
}

async function readSavedPresentations(): Promise<SavedPresentation[]> {
  return readJsonFile<SavedPresentation[]>(SAVED_PRESENTATIONS_FILE, []);
}

async function writeSavedPresentations(items: SavedPresentation[]): Promise<void> {
  await writeJsonFile(SAVED_PRESENTATIONS_FILE, items);
}

export async function getUserDownloadHistory(
  userId: string
): Promise<DownloadHistoryItem[]> {
  const items = await readDownloadHistory();

  return items
    .filter((item) => item.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime()
    );
}

export async function addUserDownloadHistory(
  userId: string,
  item: NewDownloadHistoryItem
): Promise<DownloadHistoryItem> {
  const items = await readDownloadHistory();
  const historyItem: DownloadHistoryItem = {
    id: randomUUID(),
    userId,
    title: item.title,
    slideshareUrl: item.slideshareUrl,
    format: item.format,
    downloadUrl: item.downloadUrl,
    downloadedAt: new Date().toISOString(),
  };

  items.push(historyItem);
  await writeDownloadHistory(items);

  return historyItem;
}

export async function deleteUserDownloadHistoryItem(
  userId: string,
  itemId: string
): Promise<boolean> {
  const items = await readDownloadHistory();
  const nextItems = items.filter(
    (item) => !(item.userId === userId && item.id === itemId)
  );

  if (nextItems.length === items.length) {
    return false;
  }

  await writeDownloadHistory(nextItems);
  return true;
}

export async function getUserSavedPresentations(
  userId: string
): Promise<SavedPresentation[]> {
  const items = await readSavedPresentations();

  return items
    .filter((item) => item.userId === userId)
    .sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    );
}

export async function addUserSavedPresentation(
  userId: string,
  item: NewSavedPresentation
): Promise<SavedPresentation> {
  const items = await readSavedPresentations();
  const existingIndex = items.findIndex(
    (saved) =>
      saved.userId === userId &&
      saved.slideshareUrl.toLowerCase() === item.slideshareUrl.toLowerCase()
  );
  const savedItem: SavedPresentation = {
    id: existingIndex >= 0 ? items[existingIndex].id : randomUUID(),
    userId,
    title: item.title,
    slideshareUrl: item.slideshareUrl,
    thumbnailUrl: item.thumbnailUrl,
    savedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    items[existingIndex] = savedItem;
  } else {
    items.push(savedItem);
  }

  await writeSavedPresentations(items);
  return savedItem;
}

export async function deleteUserSavedPresentation(
  userId: string,
  itemId: string
): Promise<boolean> {
  const items = await readSavedPresentations();
  const nextItems = items.filter(
    (item) => !(item.userId === userId && item.id === itemId)
  );

  if (nextItems.length === items.length) {
    return false;
  }

  await writeSavedPresentations(nextItems);
  return true;
}

export async function deleteAllUserDashboardData(userId: string): Promise<void> {
  const [history, saved] = await Promise.all([
    readDownloadHistory(),
    readSavedPresentations(),
  ]);

  await Promise.all([
    writeDownloadHistory(history.filter((item) => item.userId !== userId)),
    writeSavedPresentations(saved.filter((item) => item.userId !== userId)),
  ]);
}
