import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi, adminSaveErrorResponse } from "@/lib/admin-api";
import { getHomepageContent, saveHomepageContent } from "@/lib/data/homepage";
import type { HomepageContentData } from "@/types/content";

export async function GET() {
  const authError = await requireAdminApi();
  if (authError) return authError;

  const content = await getHomepageContent();
  return NextResponse.json(content);
}

export async function PUT(request: Request) {
  const authError = await requireAdminApi();
  if (authError) return authError;

  try {
    const body = (await request.json()) as HomepageContentData;
    await saveHomepageContent(body);
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    return adminSaveErrorResponse(error, "Failed to save homepage content");
  }
}
