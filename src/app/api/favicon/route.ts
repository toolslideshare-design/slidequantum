import { NextResponse } from "next/server";
import { getFaviconSettings } from "@/lib/data/favicon";

export async function GET(request: Request) {
  const settings = await getFaviconSettings();

  if (settings.dataBase64) {
    const buffer = Buffer.from(settings.dataBase64, "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": settings.contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  return NextResponse.redirect(new URL(settings.href, request.url));
}
