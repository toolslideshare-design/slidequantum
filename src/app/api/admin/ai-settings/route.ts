import { NextResponse } from "next/server";
import { requireAdminApi, adminSaveErrorResponse } from "@/lib/admin-api";
import {
  getAiSettings,
  maskGeminiKey,
  saveAiSettings,
} from "@/lib/data/ai-settings";

export async function GET() {
  const authError = await requireAdminApi();
  if (authError) return authError;

  const settings = await getAiSettings();
  return NextResponse.json(maskGeminiKey(settings));
}

export async function PUT(request: Request) {
  const authError = await requireAdminApi();
  if (authError) return authError;

  try {
    const body = (await request.json()) as { geminiApiKey?: string };
    const settings = await saveAiSettings(body.geminiApiKey ?? "");

    return NextResponse.json({
      success: true,
      settings: maskGeminiKey(settings),
    });
  } catch (error) {
    return adminSaveErrorResponse(error, "Failed to save AI settings.");
  }
}
