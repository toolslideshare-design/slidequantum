import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi, adminSaveErrorResponse } from "@/lib/admin-api";
import { getSiteSettings, saveSiteSettings } from "@/lib/data/settings";
import type { SiteSettings } from "@/types/content";

export async function GET() {
  const authError = await requireAdminApi();
  if (authError) return authError;

  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const authError = await requireAdminApi();
  if (authError) return authError;

  try {
    const body = (await request.json()) as SiteSettings;
    await saveSiteSettings(body);
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (error) {
    return adminSaveErrorResponse(error, "Failed to save settings");
  }
}
