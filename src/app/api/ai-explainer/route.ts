import { NextResponse } from "next/server";
import type {
  AiExplainerMode,
  AiPresentationExplainer,
} from "@/types/content";
import {
  AiGenerationError,
  extractPresentationText,
  generateGeminiExplainer,
  generateGeminiExplainerFollowUp,
  isSlideshareUrl,
} from "@/lib/ai/presentation-summary";

export const runtime = "nodejs";

type AiExplainerRequest = {
  url?: string;
  title?: string;
  mode?: AiExplainerMode;
  question?: string;
};

const explainerCache = new Map<
  string,
  { explainer: AiPresentationExplainer; generatedAt: number; title: string }
>();
const CACHE_TTL_MS = 1000 * 60 * 20;

function getCacheKey(url: string, mode: AiExplainerMode) {
  return `${url.trim().toLowerCase()}::${mode}`;
}

function normalizeMode(mode: unknown): AiExplainerMode {
  if (mode === "student" || mode === "professional") {
    return mode;
  }

  return "beginner";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AiExplainerRequest;
    const slideshareUrl = body.url?.trim() ?? "";
    const mode = normalizeMode(body.mode);
    const question = body.question?.trim() ?? "";

    console.info("[ai-explainer] request received", {
      hasUrl: Boolean(slideshareUrl),
      hasTitle: Boolean(body.title?.trim()),
      mode,
      hasQuestion: Boolean(question),
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

    const cacheKey = getCacheKey(slideshareUrl, mode);

    if (!question) {
      const cached = explainerCache.get(cacheKey);

      if (cached && Date.now() - cached.generatedAt < CACHE_TTL_MS) {
        console.info("[ai-explainer] cache hit", { cacheKey });
        return NextResponse.json({
          success: true,
          cached: true,
          title: cached.title,
          mode,
          explainer: cached.explainer,
        });
      }
    }

    const extracted = await extractPresentationText(slideshareUrl);
    const title = body.title?.trim() || extracted.title;

    console.info("[ai-explainer] presentation text extracted", {
      title,
      mode,
      contentLength: extracted.content.length,
      hasQuestion: Boolean(question),
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

    if (question) {
      const followUp = await generateGeminiExplainerFollowUp({
        title,
        content: extracted.content,
        mode,
        question,
      });

      console.info("[ai-explainer] follow-up generated", {
        mode,
        answerLength: followUp.answer.length,
      });

      return NextResponse.json({
        success: true,
        title,
        mode,
        followUp,
      });
    }

    const explainer = await generateGeminiExplainer({
      title,
      content: extracted.content,
      mode,
    });

    console.info("[ai-explainer] explanation generated", {
      mode,
      sections: explainer.sections.length,
    });

    explainerCache.set(cacheKey, {
      explainer,
      generatedAt: Date.now(),
      title,
    });

    return NextResponse.json({
      success: true,
      cached: false,
      title,
      mode,
      explainer,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate AI explanation.";
    const status = error instanceof AiGenerationError ? error.status : 500;

    console.error("[ai-explainer] request failed", { status, message });

    return NextResponse.json(
      {
        error: message,
      },
      { status }
    );
  }
}
