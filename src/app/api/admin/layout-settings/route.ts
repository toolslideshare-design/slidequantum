import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/admin-api";
import {
  getLayoutSettings,
  saveLayoutSettings,
} from "@/lib/data/layout-settings";
import type { LayoutSettings } from "@/types/content";

export async function GET() {
  const authError = await requireAdminApi();
  if (authError) return authError;

  const settings = await getLayoutSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const authError = await requireAdminApi();
  if (authError) return authError;

  try {
    const body = (await request.json()) as LayoutSettings;
    await saveLayoutSettings(body);
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to save layout settings" },
      { status: 400 }
    );
  }
}
