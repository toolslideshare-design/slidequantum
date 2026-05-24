import "server-only";

import { GoogleGenAI } from "@google/genai";
import type {
  AiExplainerFollowUp,
  AiExplainerMode,
  AiPresentationNotes,
  AiPresentationExplainer,
  AiPresentationQuiz,
  AiPresentationSummary,
  AiQuizQuestion,
} from "@/types/content";
import { getAiSettings } from "@/lib/data/ai-settings";

const PRIMARY_GEMINI_MODEL = "gemini-1.5-flash";
const FALLBACK_GEMINI_MODEL = "gemini-2.5-flash";

type GeminiGenerateResponse = {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
    finishReason?: string;
  }[];
};

const requestHeaders = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
};

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(value: string): string {
  return decodeHtmlEntities(value.replace(/<[^>]+>/g, " "));
}

function extractMatches(html: string, patterns: RegExp[]): string[] {
  const values = new Set<string>();

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const value = match[1] ? stripHtml(match[1]) : "";

      if (value.length > 2) {
        values.add(value);
      }
    }
  }

  return Array.from(values);
}

export function isSlideshareUrl(input: string): boolean {
  try {
    const parsed = new URL(input);
    return (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      (parsed.hostname === "slideshare.net" ||
        parsed.hostname.endsWith(".slideshare.net"))
    );
  } catch {
    return false;
  }
}

export async function extractPresentationText(slideshareUrl: string) {
  const response = await fetch(slideshareUrl, {
    headers: requestHeaders,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not fetch the SlideShare page.");
  }

  const html = await response.text();
  const title =
    extractMatches(html, [
      /property=["']og:title["'][^>]*content=["']([^"']+)["']/gi,
      /content=["']([^"']+)["'][^>]*property=["']og:title["']/gi,
      /<title>([^<]+)<\/title>/gi,
    ])[0]?.replace(/\s*[-|]\s*SlideShare\s*$/i, "") ??
    "SlideShare Presentation";
  const description =
    extractMatches(html, [
      /name=["']description["'][^>]*content=["']([^"']+)["']/gi,
      /property=["']og:description["'][^>]*content=["']([^"']+)["']/gi,
      /content=["']([^"']+)["'][^>]*property=["']og:description["']/gi,
    ])[0] ?? "";
  const headings = extractMatches(html, [
    /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi,
  ]);
  const imageAltText = extractMatches(html, [
    /<img[^>]+alt=["']([^"']{3,220})["'][^>]*>/gi,
  ]);
  const slideText = extractMatches(html, [
    /"slide_text"\s*:\s*"([^"]+)"/gi,
    /"description"\s*:\s*"([^"]{12,500})"/gi,
    /"name"\s*:\s*"([^"]{4,220})"/gi,
  ]);
  const content = [
    `Title: ${title}`,
    description && `Description: ${description}`,
    headings.length && `Headings: ${headings.slice(0, 20).join(" | ")}`,
    imageAltText.length &&
      `Slide image labels: ${imageAltText.slice(0, 40).join(" | ")}`,
    slideText.length && `Extracted slide text: ${slideText.slice(0, 60).join(" | ")}`,
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 7000);

  return {
    title,
    content,
  };
}

function cleanGeminiJson(rawText: string) {
  const cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

  return jsonMatch ? jsonMatch[0] : cleaned;
}

export class AiGenerationError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "AiGenerationError";
    this.status = status;
  }
}

function parseSummaryJson(rawText: string): AiPresentationSummary {
  let parsed: Partial<AiPresentationSummary>;

  try {
    parsed = JSON.parse(cleanGeminiJson(rawText)) as Partial<AiPresentationSummary>;
  } catch {
    console.error("[ai] Summary JSON parse failed", {
      rawPreview: rawText.slice(0, 300),
    });
    throw new AiGenerationError("Gemini returned a response that could not be parsed.", 502);
  }

  return {
    shortSummary:
      typeof parsed.shortSummary === "string"
        ? parsed.shortSummary
        : "AI generated a summary, but it could not be formatted correctly.",
    keyPoints: Array.isArray(parsed.keyPoints)
      ? parsed.keyPoints.filter((item): item is string => typeof item === "string")
      : [],
    mainTopics: Array.isArray(parsed.mainTopics)
      ? parsed.mainTopics.filter((item): item is string => typeof item === "string")
      : [],
  };
}

function parseNotesJson(rawText: string): AiPresentationNotes {
  let parsed: Partial<AiPresentationNotes>;

  try {
    parsed = JSON.parse(cleanGeminiJson(rawText)) as Partial<AiPresentationNotes>;
  } catch {
    console.error("[ai] Notes JSON parse failed", {
      rawPreview: rawText.slice(0, 300),
    });
    throw new AiGenerationError("Gemini returned notes that could not be parsed.", 502);
  }

  return {
    studyNotes: Array.isArray(parsed.studyNotes)
      ? parsed.studyNotes.filter((item): item is string => typeof item === "string")
      : [],
    importantConcepts: Array.isArray(parsed.importantConcepts)
      ? parsed.importantConcepts.filter((item): item is string => typeof item === "string")
      : [],
    quickRevision:
      typeof parsed.quickRevision === "string"
        ? parsed.quickRevision
        : "AI generated revision notes, but they could not be formatted correctly.",
  };
}

function normalizeQuestionType(value: unknown): AiQuizQuestion["type"] {
  if (value === "true_false" || value === "short_answer") {
    return value;
  }

  return "mcq";
}

function parseQuizJson(rawText: string): AiPresentationQuiz {
  let parsed: Partial<AiPresentationQuiz>;

  try {
    parsed = JSON.parse(cleanGeminiJson(rawText)) as Partial<AiPresentationQuiz>;
  } catch {
    console.error("[ai] Quiz JSON parse failed", {
      rawPreview: rawText.slice(0, 300),
    });
    throw new AiGenerationError("Gemini returned a quiz that could not be parsed.", 502);
  }

  const questions = Array.isArray(parsed.questions)
    ? parsed.questions
        .map((item): AiQuizQuestion | null => {
          if (!item || typeof item !== "object") {
            return null;
          }

          const question = item as Partial<AiQuizQuestion>;
          const type = normalizeQuestionType(question.type);
          const options =
            type === "mcq"
              ? Array.isArray(question.options)
                ? question.options.filter(
                    (option): option is string => typeof option === "string"
                  )
                : []
              : type === "true_false"
                ? ["True", "False"]
                : [];
          const correctAnswer =
            typeof question.correctAnswer === "string"
              ? question.correctAnswer.trim()
              : "";

          if (
            typeof question.question !== "string" ||
            !question.question.trim() ||
            !correctAnswer
          ) {
            return null;
          }

          if (type === "mcq" && options.length !== 4) {
            return null;
          }

          return {
            type,
            question: question.question.trim(),
            options,
            correctAnswer,
          };
        })
        .filter((item): item is AiQuizQuestion => Boolean(item))
    : [];

  if (!questions.length) {
    throw new AiGenerationError("Gemini did not return usable quiz questions.", 502);
  }

  return { questions };
}

function parseExplainerJson(rawText: string): AiPresentationExplainer {
  let parsed: Partial<AiPresentationExplainer>;

  try {
    parsed = JSON.parse(cleanGeminiJson(rawText)) as Partial<AiPresentationExplainer>;
  } catch {
    console.error("[ai] Explainer JSON parse failed", {
      rawPreview: rawText.slice(0, 300),
    });
    throw new AiGenerationError(
      "Gemini returned an explanation that could not be parsed.",
      502
    );
  }

  const sections = Array.isArray(parsed.sections)
    ? parsed.sections
        .map((section) => ({
          title:
            section && typeof section.title === "string"
              ? section.title.trim()
              : "",
          explanation:
            section && typeof section.explanation === "string"
              ? section.explanation.trim()
              : "",
        }))
        .filter((section) => section.title && section.explanation)
    : [];

  const simpleExplanation =
    typeof parsed.simpleExplanation === "string"
      ? parsed.simpleExplanation.trim()
      : "";
  const realWorldMeaning =
    typeof parsed.realWorldMeaning === "string"
      ? parsed.realWorldMeaning.trim()
      : "";
  const easyLearningMode =
    typeof parsed.easyLearningMode === "string"
      ? parsed.easyLearningMode.trim()
      : "";
  const suggestedQuestions = Array.isArray(parsed.suggestedQuestions)
    ? parsed.suggestedQuestions.filter(
        (question): question is string => typeof question === "string"
      )
    : [];
  const ttsText =
    typeof parsed.ttsText === "string"
      ? parsed.ttsText.trim()
      : [simpleExplanation, realWorldMeaning, easyLearningMode]
          .filter(Boolean)
          .join(" ");

  if (!simpleExplanation || !sections.length) {
    throw new AiGenerationError("Gemini did not return a usable explanation.", 502);
  }

  return {
    simpleExplanation,
    sections,
    realWorldMeaning,
    easyLearningMode,
    suggestedQuestions,
    ttsText,
  };
}

function parseFollowUpJson(rawText: string): AiExplainerFollowUp {
  let parsed: Partial<AiExplainerFollowUp>;

  try {
    parsed = JSON.parse(cleanGeminiJson(rawText)) as Partial<AiExplainerFollowUp>;
  } catch {
    console.error("[ai] Explainer follow-up JSON parse failed", {
      rawPreview: rawText.slice(0, 300),
    });
    throw new AiGenerationError(
      "Gemini returned a follow-up answer that could not be parsed.",
      502
    );
  }

  const answer = typeof parsed.answer === "string" ? parsed.answer.trim() : "";
  const suggestedQuestions = Array.isArray(parsed.suggestedQuestions)
    ? parsed.suggestedQuestions.filter(
        (question): question is string => typeof question === "string"
      )
    : [];

  if (!answer) {
    throw new AiGenerationError("Gemini did not return a usable follow-up answer.", 502);
  }

  return { answer, suggestedQuestions };
}

async function getGeminiApiKey() {
  const settings = await getAiSettings();
  const apiKey = settings.geminiApiKey.trim();

  console.info("[ai] Gemini key lookup", {
    exists: Boolean(apiKey),
    updatedAt: settings.updatedAt,
  });

  if (!apiKey) {
    throw new AiGenerationError("Gemini API key missing. Add it in Admin Panel > AI Settings.", 501);
  }

  return apiKey;
}

function mapGeminiError(error: unknown): AiGenerationError {
  const message = error instanceof Error ? error.message : String(error);
  const lowerMessage = message.toLowerCase();
  let statusCode: number | null = null;

  console.error("[ai] Gemini SDK error", { message });

  try {
    const parsed = JSON.parse(message) as {
      error?: { code?: number; message?: string; status?: string };
    };
    statusCode = parsed.error?.code ?? null;
  } catch {
    statusCode = null;
  }

  if (
    statusCode === 401 ||
    statusCode === 403 ||
    lowerMessage.includes("api key not valid") ||
    lowerMessage.includes("api_key_invalid") ||
    lowerMessage.includes("permission_denied") ||
    lowerMessage.includes("unauthenticated") ||
    lowerMessage.includes("401") ||
    lowerMessage.includes("403")
  ) {
    return new AiGenerationError("Invalid Gemini API key. Check Admin Panel > AI Settings.", 401);
  }

  if (
    statusCode === 404 ||
    lowerMessage.includes("not found") ||
    lowerMessage.includes("not supported for generatecontent")
  ) {
    return new AiGenerationError("Gemini model is not available for this API key.", 404);
  }

  if (
    statusCode === 429 ||
    lowerMessage.includes("quota") ||
    lowerMessage.includes("rate limit") ||
    lowerMessage.includes("resource_exhausted") ||
    lowerMessage.includes("429")
  ) {
    return new AiGenerationError("Gemini rate limit exceeded. Please try again later.", 429);
  }

  if (lowerMessage.includes("safety") || lowerMessage.includes("blocked")) {
    return new AiGenerationError("Gemini blocked this request for safety reasons.", 400);
  }

  return new AiGenerationError(`Gemini request failed: ${message}`, 502);
}

function getGeminiText(response: GeminiGenerateResponse): string {
  return (
    response.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim() ?? ""
  );
}

async function callGeminiJson(prompt: string, maxOutputTokens = 750, feature = "ai") {
  const apiKey = await getGeminiApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const models = [PRIMARY_GEMINI_MODEL, FALLBACK_GEMINI_MODEL];

  console.info("[ai] Gemini request", {
    feature,
    primaryModel: PRIMARY_GEMINI_MODEL,
    fallbackModel: FALLBACK_GEMINI_MODEL,
    promptLength: prompt.length,
    maxOutputTokens,
    apiKeyExists: Boolean(apiKey),
  });

  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const config = {
          temperature: 0.25,
          maxOutputTokens:
            model === FALLBACK_GEMINI_MODEL
              ? Math.max(maxOutputTokens, 1400)
              : maxOutputTokens,
          responseMimeType: "application/json",
          ...(model === FALLBACK_GEMINI_MODEL
            ? { thinkingConfig: { thinkingBudget: 0 } }
            : {}),
        };
        const response = (await ai.models.generateContent({
          model,
          contents: prompt,
          config,
        })) as GeminiGenerateResponse;
        const text = getGeminiText(response);

        console.info("[ai] Gemini response", {
          feature,
          model,
          attempt,
          textLength: text.length,
          hasText: Boolean(text),
          candidateCount: response.candidates?.length ?? 0,
          finishReason: response.candidates?.[0]?.finishReason ?? "unknown",
          textPreview: text.slice(0, 160),
        });

        if (!text) {
          throw new AiGenerationError("Gemini returned an empty response.", 502);
        }

        return text;
      } catch (error) {
        const mappedError =
          error instanceof AiGenerationError ? error : mapGeminiError(error);

        console.error("[ai] Gemini attempt failed", {
          feature,
          model,
          attempt,
          status: mappedError.status,
          message: mappedError.message,
        });

        if (mappedError.status === 404 && model === PRIMARY_GEMINI_MODEL) {
          console.warn("[ai] Primary Gemini model unavailable; trying fallback", {
            feature,
            primaryModel: PRIMARY_GEMINI_MODEL,
            fallbackModel: FALLBACK_GEMINI_MODEL,
          });
          break;
        }

        if (
          attempt === 2 ||
          mappedError.status === 401 ||
          mappedError.status === 501 ||
          mappedError.status === 429
        ) {
          throw mappedError;
        }
      }
    }
  }

  throw new AiGenerationError("Gemini request failed after trying available models.", 502);
}

export async function generateGeminiSummary({
  title,
  content,
}: {
  title: string;
  content: string;
}): Promise<AiPresentationSummary> {
  const prompt = `You are helping summarize a SlideShare presentation for a SaaS downloader tool.

Return ONLY valid JSON in this exact shape:
{
  "shortSummary": "1-2 concise paragraphs",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4"],
  "mainTopics": ["topic", "topic", "topic"]
}

Keep the response concise and useful. Do not invent facts beyond the extracted content.

Presentation title: ${title}

Extracted content:
${content}`;

  const text = await callGeminiJson(prompt, 650, "summary");
  return parseSummaryJson(text);
}

export async function generateGeminiNotes({
  title,
  content,
}: {
  title: string;
  content: string;
}): Promise<AiPresentationNotes> {
  const prompt = `You are creating study notes from a SlideShare presentation.

Return ONLY valid JSON in this exact shape:
{
  "studyNotes": ["structured bullet note", "structured bullet note", "structured bullet note"],
  "importantConcepts": ["concept", "concept", "concept"],
  "quickRevision": "short revision paragraph"
}

Make the notes practical for students and professionals. Keep them concise and based only on the extracted content.

Presentation title: ${title}

Extracted content:
${content}`;

  const text = await callGeminiJson(prompt, 850, "notes");
  return parseNotesJson(text);
}

export async function generateGeminiQuiz({
  title,
  content,
}: {
  title: string;
  content: string;
}): Promise<AiPresentationQuiz> {
  const prompt = `You are creating an educational quiz from a SlideShare presentation.

Return ONLY valid JSON in this exact shape:
{
  "questions": [
    {
      "type": "mcq",
      "question": "easy-to-understand question",
      "options": ["option A", "option B", "option C", "option D"],
      "correctAnswer": "exact matching correct option"
    },
    {
      "type": "true_false",
      "question": "true or false question",
      "options": ["True", "False"],
      "correctAnswer": "True"
    },
    {
      "type": "short_answer",
      "question": "short answer question",
      "options": [],
      "correctAnswer": "concise expected answer"
    }
  ]
}

Create 8 total questions:
- 4 multiple choice questions with exactly 4 options each
- 2 true / false questions
- 2 short answer questions

Make questions educational, easy to understand, and based only on the extracted content. Avoid duplicate questions and duplicate correct answers.

Presentation title: ${title}

Extracted content:
${content}`;

  const text = await callGeminiJson(prompt, 1200, "quiz");
  return parseQuizJson(text);
}

export async function generateGeminiExplainer({
  title,
  content,
  mode,
}: {
  title: string;
  content: string;
  mode: AiExplainerMode;
}): Promise<AiPresentationExplainer> {
  const modeInstruction = {
    beginner:
      "Explain like a friendly teacher helping a beginner. Use simple words and avoid jargon.",
    student:
      "Explain like a tutor helping a student study. Include study-friendly structure and memory cues.",
    professional:
      "Explain like a presentation assistant for professionals. Keep it practical, concise, and business-useful.",
  }[mode];

  const prompt = `You are an AI presentation explainer for a SlideShare downloader SaaS tool.

Act like a teacher, tutor, and presentation assistant.
Mode: ${mode}
Mode instruction: ${modeInstruction}

Return ONLY valid JSON in this exact shape:
{
  "simpleExplanation": "beginner-friendly explanation of the whole presentation",
  "sections": [
    {
      "title": "important topic",
      "explanation": "simple section-by-section explanation"
    }
  ],
  "realWorldMeaning": "practical meaning with real-world examples",
  "easyLearningMode": "simplified explanation of difficult concepts",
  "suggestedQuestions": ["follow-up question", "follow-up question", "follow-up question"],
  "ttsText": "voice-assistant-ready plain text summary"
}

Rules:
- Use easy-to-understand language.
- Base the explanation only on the extracted presentation content.
- Create 3 to 5 section explanations.
- Make the explanation helpful for learning.
- Keep the response concise enough for a premium UI card.

Presentation title: ${title}

Extracted content:
${content}`;

  const text = await callGeminiJson(prompt, 1500, "explainer");
  return parseExplainerJson(text);
}

export async function generateGeminiExplainerFollowUp({
  title,
  content,
  mode,
  question,
}: {
  title: string;
  content: string;
  mode: AiExplainerMode;
  question: string;
}): Promise<AiExplainerFollowUp> {
  const modeInstruction = {
    beginner: "Answer in very simple beginner-friendly words.",
    student: "Answer like a helpful study tutor.",
    professional: "Answer with practical professional context.",
  }[mode];

  const prompt = `You are answering a follow-up question about a SlideShare presentation.

Mode: ${mode}
Mode instruction: ${modeInstruction}

Return ONLY valid JSON in this exact shape:
{
  "answer": "clear helpful answer",
  "suggestedQuestions": ["next useful question", "next useful question", "next useful question"]
}

Rules:
- Answer only from the presentation content.
- If the answer is not clearly available, say what can be inferred from the available content.
- Keep the answer clear and easy to understand.

Presentation title: ${title}

User question: ${question}

Extracted content:
${content}`;

  const text = await callGeminiJson(prompt, 900, "explainer-follow-up");
  return parseFollowUpJson(text);
}
