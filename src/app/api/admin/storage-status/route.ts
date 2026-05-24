import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { getStorageStatus } from "@/lib/storage/json-store";

export async function GET() {
  const authError = await requireAdminApi();
  if (authError) return authError;

  const status = await getStorageStatus();
  return NextResponse.json(status);
}
