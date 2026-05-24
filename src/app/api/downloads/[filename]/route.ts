import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const LOCAL_DOWNLOAD_DIR = path.join(process.cwd(), "public", "downloads");
const VERCEL_DOWNLOAD_DIR = path.join("/tmp", "slidequantum-downloads");

function getDownloadDir() {
  return process.env.VERCEL === "1" ? VERCEL_DOWNLOAD_DIR : LOCAL_DOWNLOAD_DIR;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> }
) {
  const { filename } = await context.params;
  const safeName = path.basename(filename);

  if (!safeName || safeName !== filename) {
    return NextResponse.json({ error: "Invalid file name." }, { status: 400 });
  }

  try {
    const filePath = path.join(getDownloadDir(), safeName);
    const buffer = await readFile(filePath);

    const extension = safeName.split(".").pop()?.toLowerCase();
    const contentType =
      extension === "pdf"
        ? "application/pdf"
        : extension === "pptx"
          ? "application/vnd.openxmlformats-officedocument.presentationml.presentation"
          : "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${safeName}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Download file not found." }, { status: 404 });
  }
}
