import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireAdminApi } from "@/lib/admin-api";
import {
  getFaviconContentType,
  getFaviconSettings,
  saveFaviconSettings,
} from "@/lib/data/favicon";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const supportedExtensions = ["ico", "png", "svg"];

function getExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

export async function GET() {
  const authError = await requireAdminApi();
  if (authError) return authError;

  const settings = await getFaviconSettings();
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  const authError = await requireAdminApi();
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get("favicon");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please upload a favicon file." },
        { status: 400 }
      );
    }

    const extension = getExtension(file.name);
    const contentType = getFaviconContentType(extension);

    if (!contentType || !supportedExtensions.includes(extension)) {
      return NextResponse.json(
        { error: "Only .png, .ico, and .svg favicon files are supported." },
        { status: 400 }
      );
    }

    const fileName = `favicon.${extension}`;
    const filePath = path.join(PUBLIC_DIR, fileName);
    const bytes = Buffer.from(await file.arrayBuffer());

    await mkdir(PUBLIC_DIR, { recursive: true });
    await writeFile(filePath, bytes);

    const settings = await saveFaviconSettings({ fileName, contentType });

    revalidatePath("/", "layout");

    return NextResponse.json({ success: true, settings });
  } catch {
    return NextResponse.json(
      { error: "Failed to upload favicon." },
      { status: 400 }
    );
  }
}
