import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/admin-api";
import { getHeadCode, saveHeadCode } from "@/lib/data/head-code";

export async function GET() {
  const authError = await requireAdminApi();
  if (authError) return authError;

  const settings = await getHeadCode();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const authError = await requireAdminApi();
  if (authError) return authError;

  try {
    const body = (await request.json()) as { code?: string };
    const settings = await saveHeadCode(body.code ?? "");

    revalidatePath("/", "layout");

    return NextResponse.json({ success: true, settings });
  } catch {
    return NextResponse.json(
      { error: "Failed to save head code." },
      { status: 400 }
    );
  }
}
