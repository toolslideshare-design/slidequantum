import "server-only";

import { randomUUID } from "crypto";
import type { DownloadHistoryItem, SavedPresentation } from "@/types/content";
import {
  DOWNLOAD_HISTORY_FILE,
  SAVED_PRESENTATIONS_FILE,
} from "@/lib/data/paths";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { readJson, writeJson } from "@/lib/storage/json-store";

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

async function readDownloadHistory(): Promise<DownloadHistoryItem[]> {
  return readJson(STORAGE_KEYS.downloadHistory, {
    filePath: DOWNLOAD_HISTORY_FILE,
    fallback: [],
  });
}

async function writeDownloadHistory(items: DownloadHistoryItem[]): Promise<void> {
  await writeJson(STORAGE_KEYS.downloadHistory, items, {
    filePath: DOWNLOAD_HISTORY_FILE,
  });
}

async function readSavedPresentations(): Promise<SavedPresentation[]> {
  return readJson(STORAGE_KEYS.savedPresentations, {
    filePath: SAVED_PRESENTATIONS_FILE,
    fallback: [],
  });
}

async function writeSavedPresentations(items: SavedPresentation[]): Promise<void> {
  await writeJson(STORAGE_KEYS.savedPresentations, items, {
    filePath: SAVED_PRESENTATIONS_FILE,
  });
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
