import { NextResponse } from "next/server";
import type { AiPresentationNotes } from "@/types/content";
import {
  AiGenerationError,
  extractPresentationText,
  generateGeminiNotes,
  isSlideshareUrl,
} from "@/lib/ai/presentation-summary";

export const runtime = "nodejs";

type AiNotesRequest = {
  url?: string;
  title?: string;
};

const notesCache = new Map<
  string,
  { notes: AiPresentationNotes; generatedAt: number; title: string }
>();
const CACHE_TTL_MS = 1000 * 60 * 20;

function getCacheKey(url: string) {
  return url.trim().toLowerCase();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AiNotesRequest;
    const slideshareUrl = body.url?.trim() ?? "";

    console.info("[ai-notes] request received", {
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
    const cached = notesCache.get(cacheKey);

    if (cached && Date.now() - cached.generatedAt < CACHE_TTL_MS) {
      console.info("[ai-notes] cache hit", { cacheKey });
      return NextResponse.json({
        success: true,
        cached: true,
        title: cached.title,
        notes: cached.notes,
      });
    }

    const extracted = await extractPresentationText(slideshareUrl);
    const title = body.title?.trim() || extracted.title;

    console.info("[ai-notes] presentation text extracted", {
      title,
      contentLength: extracted.content.length,
    });

    if (!extracted.content || extracted.content.length < 20) {
      return NextResponse.json(
        {
          error:
            "Not enough public text was found to create notes for this presentation yet.",
        },
        { status: 422 }
      );
    }

    const notes = await generateGeminiNotes({
      title,
      content: extracted.content,
    });

    console.info("[ai-notes] notes generated", {
      studyNotes: notes.studyNotes.length,
      concepts: notes.importantConcepts.length,
    });

    notesCache.set(cacheKey, {
      notes,
      generatedAt: Date.now(),
      title,
    });

    return NextResponse.json({
      success: true,
      cached: false,
      title,
      notes,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate AI notes.";
    const status = error instanceof AiGenerationError ? error.status : 500;

    console.error("[ai-notes] request failed", { status, message });

    return NextResponse.json(
      {
        error: message,
      },
      { status }
    );
  }
}
