import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi, adminSaveErrorResponse } from "@/lib/admin-api";
import { getBodyCode, saveBodyCode } from "@/lib/data/body-code";

export async function GET() {
  const authError = await requireAdminApi();
  if (authError) return authError;

  const settings = await getBodyCode();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const authError = await requireAdminApi();
  if (authError) return authError;

  try {
    const body = (await request.json()) as { code?: string };
    const settings = await saveBodyCode(body.code ?? "");

    revalidatePath("/", "layout");

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return adminSaveErrorResponse(error, "Failed to save body code.");
  }
}
