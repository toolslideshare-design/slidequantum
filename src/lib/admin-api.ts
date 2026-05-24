import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { handleStorageError } from "@/lib/storage/json-store";

export async function requireAdminApi() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export function adminSaveErrorResponse(error: unknown, fallbackMessage: string) {
  const result = handleStorageError(error, fallbackMessage);
  return NextResponse.json(result.body, { status: result.status });
}