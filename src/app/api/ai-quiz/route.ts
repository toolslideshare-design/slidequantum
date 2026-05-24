import { NextResponse } from "next/server";
import type { AiPresentationQuiz } from "@/types/content";
import {
  AiGenerationError,
  extractPresentationText,
  generateGeminiQuiz,
  isSlideshareUrl,
} from "@/lib/ai/presentation-summary";

export const runtime = "nodejs";

type AiQuizRequest = {
  url?: string;
  title?: string;
};

const quizCache = new Map<
  string,
  { quiz: AiPresentationQuiz; generatedAt: number; title: string }
>();
const CACHE_TTL_MS = 1000 * 60 * 20;

function getCacheKey(url: string) {
  return url.trim().toLowerCase();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AiQuizRequest;
    const slideshareUrl = body.url?.trim() ?? "";

    console.info("[ai-quiz] request received", {
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
    const cached = quizCache.get(cacheKey);

    if (cached && Date.now() - cached.generatedAt < CACHE_TTL_MS) {
      console.info("[ai-quiz] cache hit", { cacheKey });
      return NextResponse.json({
        success: true,
        cached: true,
        title: cached.title,
        quiz: cached.quiz,
      });
    }

    const extracted = await extractPresentationText(slideshareUrl);
    const title = body.title?.trim() || extracted.title;

    console.info("[ai-quiz] presentation text extracted", {
      title,
      contentLength: extracted.content.length,
    });

    if (!extracted.content || extracted.content.length < 20) {
      return NextResponse.json(
        {
          error:
            "No presentation text found. Preview a public SlideShare presentation with readable text first.",
        },
        { status: 422 }
      );
    }

    const quiz = await generateGeminiQuiz({
      title,
      content: extracted.content,
    });

    console.info("[ai-quiz] quiz generated", {
      questions: quiz.questions.length,
    });

    quizCache.set(cacheKey, {
      quiz,
      generatedAt: Date.now(),
      title,
    });

    return NextResponse.json({
      success: true,
      cached: false,
      title,
      quiz,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate AI quiz.";
    const status = error instanceof AiGenerationError ? error.status : 500;

    console.error("[ai-quiz] request failed", { status, message });

    return NextResponse.json(
      {
        error: message,
      },
      { status }
    );
  }
}
