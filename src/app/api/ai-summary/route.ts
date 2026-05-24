import { NextResponse } from "next/server";
import type { AiPresentationSummary } from "@/types/content";
import {
  AiGenerationError,
  extractPresentationText,
  generateGeminiSummary,
  isSlideshareUrl,
} from "@/lib/ai/presentation-summary";

export const runtime = "nodejs";

type AiSummaryRequest = {
  url?: string;
  title?: string;
};

const summaryCache = new Map<
  string,
  { summary: AiPresentationSummary; generatedAt: number; title: string }
>();
const CACHE_TTL_MS = 1000 * 60 * 20;

function getCacheKey(url: string) {
  return url.trim().toLowerCase();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AiSummaryRequest;
    const slideshareUrl = body.url?.trim() ?? "";

    console.info("[ai-summary] request received", {
      hasUrl: Boolean(slideshareUrl),
      hasTitle: Boolean(body.title?.trim()),
    });

    if (!slideshareUrl) {
      return NextResponse.json(
        { error: "SlideShare URL is required." },
        { status: 400 }
      );
    }

    if (!isSlideshareUrl(slideshareUrl)) {
      return NextResponse.json(
        { error: "Only public SlideShare URLs are supported." },
        { status: 400 }
      );
    }

    const cacheKey = getCacheKey(slideshareUrl);
    const cached = summaryCache.get(cacheKey);

    if (cached && Date.now() - cached.generatedAt < CACHE_TTL_MS) {
      console.info("[ai-summary] cache hit", { cacheKey });
      return NextResponse.json({
        success: true,
        cached: true,
        title: cached.title,
        summary: cached.summary,
      });
    }

    const extracted = await extractPresentationText(slideshareUrl);
    const title = body.title?.trim() || extracted.title;

    console.info("[ai-summary] presentation text extracted", {
      title,
      contentLength: extracted.content.length,
    });

    if (!extracted.content || extracted.content.length < 20) {
      return NextResponse.json(
        {
          error:
            "Not enough public text was found to summarize this presentation yet.",
        },
        { status: 422 }
      );
    }

    const summary = await generateGeminiSummary({
      title,
      content: extracted.content,
    });

    console.info("[ai-summary] summary generated", {
      keyPoints: summary.keyPoints.length,
      topics: summary.mainTopics.length,
    });

    summaryCache.set(cacheKey, {
      summary,
      generatedAt: Date.now(),
      title,
    });

    return NextResponse.json({
      success: true,
      cached: false,
      title,
      summary,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate AI summary.";
    const status = error instanceof AiGenerationError ? error.status : 500;

    console.error("[ai-summary] request failed", { status, message });

    return NextResponse.json(
      {
        error: message,
      },
      { status }
    );
  }
}
