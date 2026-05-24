import "server-only";

import { mkdir, readFile, writeFile } from "fs/promises";

const STORAGE_PREFIX = "slidequantum:";

export const PRODUCTION_STORAGE_ERROR =
  "Production storage is not configured. Connect Upstash Redis from the Vercel Marketplace, then add KV_REST_API_URL and KV_REST_API_TOKEN to your environment variables and redeploy.";

export class StorageUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageUnavailableError";
  }
}

export type StorageMode = "filesystem" | "kv" | "read-only";

export type StorageStatus = {
  environment: "local" | "vercel";
  mode: StorageMode;
  writable: boolean;
  kvConfigured: boolean;
  kvConnected: boolean;
  message: string;
};

export function isProductionEnvironment(): boolean {
  return process.env.VERCEL === "1";
}

export function isKvStorageEnabled(): boolean {
  return Boolean(
    (process.env.KV_REST_API_URL?.trim() &&
      process.env.KV_REST_API_TOKEN?.trim()) ||
      (process.env.UPSTASH_REDIS_REST_URL?.trim() &&
        process.env.UPSTASH_REDIS_REST_TOKEN?.trim())
  );
}

export function canUseFilesystemWrites(): boolean {
  return !isProductionEnvironment();
}

function storageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

async function getKvClient() {
  const { kv } = await import("@vercel/kv");
  return kv;
}

async function verifyKvConnection(): Promise<boolean> {
  if (!isKvStorageEnabled()) {
    return false;
  }

  try {
    const kv = await getKvClient();
    await kv.get(storageKey("__health__"));
    return true;
  } catch {
    return false;
  }
}

export async function getStorageStatus(): Promise<StorageStatus> {
  const kvConfigured = isKvStorageEnabled();
  const kvConnected = kvConfigured ? await verifyKvConnection() : false;

  if (!isProductionEnvironment()) {
    return {
      environment: "local",
      mode: kvConfigured && kvConnected ? "kv" : "filesystem",
      writable: true,
      kvConfigured,
      kvConnected,
      message: kvConnected
        ? "Local development with KV storage enabled."
        : "Local development using JSON files.",
    };
  }

  if (kvConfigured && kvConnected) {
    return {
      environment: "vercel",
      mode: "kv",
      writable: true,
      kvConfigured: true,
      kvConnected: true,
      message: "Production KV storage is connected. Admin saves will persist.",
    };
  }

  if (kvConfigured && !kvConnected) {
    return {
      environment: "vercel",
      mode: "read-only",
      writable: false,
      kvConfigured: true,
      kvConnected: false,
      message:
        "KV credentials are set but the connection failed. Verify KV_REST_API_URL and KV_REST_API_TOKEN, then redeploy.",
    };
  }

  return {
    environment: "vercel",
    mode: "read-only",
    writable: false,
    kvConfigured: false,
    kvConnected: false,
    message: PRODUCTION_STORAGE_ERROR,
  };
}

type ReadJsonOptions<T> = {
  filePath?: string;
  fallback: T;
};

type WriteJsonOptions = {
  filePath?: string;
};

export async function readJson<T>(
  key: string,
  options: ReadJsonOptions<T>
): Promise<T> {
  if (isKvStorageEnabled()) {
    try {
      const kv = await getKvClient();
      const value = await kv.get<T>(storageKey(key));

      if (value !== null && value !== undefined) {
        return value;
      }
    } catch {
      // Fall back to bundled JSON files when KV is unavailable.
    }
  }

  if (options.filePath) {
    try {
      const raw = await readFile(options.filePath, "utf8");
      return JSON.parse(raw) as T;
    } catch {
      // Fall back to coded defaults.
    }
  }

  return options.fallback;
}

export async function writeJson<T>(
  key: string,
  value: T,
  options: WriteJsonOptions = {}
): Promise<void> {
  if (isKvStorageEnabled()) {
    try {
      const kv = await getKvClient();
      await kv.set(storageKey(key), value);
      return;
    } catch (error) {
      throw new StorageUnavailableError(
        error instanceof Error
          ? `KV save failed: ${error.message}`
          : "KV save failed. Check your Redis connection and redeploy."
      );
    }
  }

  if (canUseFilesystemWrites() && options.filePath) {
    await mkdir(options.filePath.replace(/[/\\][^/\\]+$/, ""), {
      recursive: true,
    });
    await writeFile(options.filePath, JSON.stringify(value, null, 2), "utf8");
    return;
  }

  throw new StorageUnavailableError(PRODUCTION_STORAGE_ERROR);
}

export async function deleteJson(key: string): Promise<void> {
  if (isKvStorageEnabled()) {
    try {
      const kv = await getKvClient();
      await kv.del(storageKey(key));
      return;
    } catch (error) {
      throw new StorageUnavailableError(
        error instanceof Error
          ? `KV delete failed: ${error.message}`
          : "KV delete failed. Check your Redis connection and redeploy."
      );
    }
  }

  if (canUseFilesystemWrites()) {
    return;
  }

  throw new StorageUnavailableError(PRODUCTION_STORAGE_ERROR);
}

export function handleStorageError(error: unknown, fallbackMessage: string) {
  if (error instanceof StorageUnavailableError) {
    return {
      body: { error: error.message, storageError: true },
      status: 503 as const,
    };
  }

  return {
    body: { error: fallbackMessage, storageError: false },
    status: 400 as const,
  };
}
