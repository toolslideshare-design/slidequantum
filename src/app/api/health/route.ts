import { NextResponse } from "next/server";

/**
 * Health check endpoint — useful when you add a real backend later.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "slideshare-downloader",
    timestamp: new Date().toISOString(),
  });
}
