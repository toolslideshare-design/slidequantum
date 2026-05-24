import { NextResponse } from "next/server";
import { getStorageStatus } from "@/lib/storage/json-store";

export async function GET() {
  const storage = await getStorageStatus();

  return NextResponse.json({
    status: storage.writable ? "ok" : "degraded",
    service: "slidequantum",
    storage,
    timestamp: new Date().toISOString(),
  });
}
