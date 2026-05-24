import fs from "node:fs";
import path from "node:path";

const root = path.resolve("c:/Users/Administrator/Desktop/slideshare Downloader");
const srcPath = path.join(root, "src/components/sections/hero.tsx");
const outPath = path.join(root, "src/components/sections/hero-preview-workspace.tsx");

const lines = fs.readFileSync(srcPath, "utf8").split(/\r?\n/);

const handlerBlock = lines.slice(293, 805).join("\n");
const previewBlock = lines.slice(1029, 2236).join("\n");

const header = `"use client";

import {
  Bookmark,
  Bot,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Eye,
  FileDown,
  FileText,
  Loader2,
  NotebookText,
  RefreshCcw,
  Send,
  Share2,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { memo, useEffect, useRef, useState } from "react";
import type {
  AiExplainerFollowUp,
  AiExplainerMode,
  AiPresentationNotes,
  AiPresentationExplainer,
  AiPresentationQuiz,
  AiPresentationSummary,
  AiQuizQuestion,
} from "@/types/content";
import { Button } from "@/components/ui/button";
import { RemoteImage } from "@/components/ui/remote-image";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";

export type PreviewData = {
  previewImages: string[];
  slideCount: number;
  message?: string;
  title?: string;
};

type AiSummaryResponse = {
  success?: boolean;
  cached?: boolean;
  title?: string;
  summary?: AiPresentationSummary;
  error?: string;
};

type AiNotesResponse = {
  success?: boolean;
  cached?: boolean;
  title?: string;
  notes?: AiPresentationNotes;
  error?: string;
};

type AiQuizResponse = {
  success?: boolean;
  cached?: boolean;
  title?: string;
  quiz?: AiPresentationQuiz;
  error?: string;
};

type AiExplainerResponse = {
  success?: boolean;
  cached?: boolean;
  title?: string;
  mode?: AiExplainerMode;
  explainer?: AiPresentationExplainer;
  followUp?: AiExplainerFollowUp;
  error?: string;
};

type ExplainerChatMessage = {
  role: "user" | "assistant";
  text: string;
};

export type HeroPreviewWorkspaceProps = {
  slideshareUrl: string;
  format: "PPT" | "PDF";
  setFormat: (format: "PPT" | "PDF") => void;
  previewData: PreviewData;
  isLoading: boolean;
  onDownload: () => void;
};

function TypewriterTextComponent({ text }: { text: string }) {
  const reducedMotion = usePrefersReducedMotion();
  const [visibleText, setVisibleText] = useState(reducedMotion ? text : "");

  useEffect(() => {
    if (reducedMotion) {
      setVisibleText(text);
      return;
    }

    setVisibleText("");
    const chunkSize = Math.max(4, Math.ceil(text.length / 80));
    const interval = window.setInterval(() => {
      setVisibleText((current) => {
        if (current.length >= text.length) {
          window.clearInterval(interval);
          return text;
        }

        return text.slice(0, current.length + chunkSize);
      });
    }, 24);

    return () => window.clearInterval(interval);
  }, [reducedMotion, text]);

  return <>{visibleText}</>;
}

const TypewriterText = memo(TypewriterTextComponent);

export function HeroPreviewWorkspace({
  slideshareUrl,
  format,
  setFormat,
  previewData,
  isLoading,
  onDownload,
}: HeroPreviewWorkspaceProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [showAllSlides, setShowAllSlides] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [isSavingPresentation, setIsSavingPresentation] = useState(false);
  const [aiSummary, setAiSummary] = useState<AiPresentationSummary | null>(null);
  const [aiSummaryError, setAiSummaryError] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryCache, setSummaryCache] = useState<Record<string, AiPresentationSummary>>({});
  const [aiNotes, setAiNotes] = useState<AiPresentationNotes | null>(null);
  const [aiNotesError, setAiNotesError] = useState("");
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [notesCache, setNotesCache] = useState<Record<string, AiPresentationNotes>>({});
  const [aiQuiz, setAiQuiz] = useState<AiPresentationQuiz | null>(null);
  const [aiQuizError, setAiQuizError] = useState("");
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizCache, setQuizCache] = useState<Record<string, AiPresentationQuiz>>({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [aiExplainer, setAiExplainer] = useState<AiPresentationExplainer | null>(null);
  const [aiExplainerError, setAiExplainerError] = useState("");
  const [isGeneratingExplainer, setIsGeneratingExplainer] = useState(false);
  const [explainerCache, setExplainerCache] = useState<
    Record<string, AiPresentationExplainer>
  >({});
  const [explainerMode, setExplainerMode] = useState<AiExplainerMode>("beginner");
  const [explainerChatMessages, setExplainerChatMessages] = useState<
    ExplainerChatMessage[]
  >([]);
  const [explainerFollowUpInput, setExplainerFollowUpInput] = useState("");
  const [isExplainerFollowUpLoading, setIsExplainerFollowUpLoading] = useState(false);
  const [explainerSuggestedQuestions, setExplainerSuggestedQuestions] = useState<
    string[]
  >([]);
  const [expandedExplainerSections, setExpandedExplainerSections] = useState<
    Record<number, boolean>
  >({ 0: true });
  const [aiToast, setAiToast] = useState("");
  const [aiPanelsMounted, setAiPanelsMounted] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const explainerRef = useRef<HTMLDivElement | null>(null);
  const summaryRequestRef = useRef(false);
  const notesRequestRef = useRef(false);
  const quizRequestRef = useRef(false);
  const explainerRequestRef = useRef(false);

  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "center",
      });
    }
  }, [reducedMotion]);

  useEffect(() => {
    if (aiExplainer && explainerRef.current) {
      explainerRef.current.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "nearest",
      });
    }
  }, [aiExplainer, reducedMotion]);

  const handleDownload = onDownload;

`;

const optimizedPreview = previewBlock
  .replace(
    /<motion\.div\s+className="pointer-events-none absolute left-1\/2 top-0 h-56 w-96 -translate-x-1\/2 rounded-full bg-orange-500\/20 blur-3xl"[\s\S]*?aria-hidden\s*\/>/,
    '<div className="pointer-events-none absolute left-1/2 top-0 h-56 w-96 -translate-x-1/2 rounded-full bg-orange-500/15 blur-2xl" aria-hidden />'
  )
  .replace(/\s+layout/g, "")
  .replace(
    /<motion\.div\s+layout\s+className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">/,
    '<div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">'
  )
  .replace(
    /<\/motion\.div>\s*\n\s*\{previewData\.previewImages\.length > 8/,
    "</div>\n\n                  {previewData.previewImages.length > 4"
  )
  .replace(/previewData\.previewImages\.length > 8/g, "previewData.previewImages.length > 4")
  .replace(/index < 8 \? index \* 0\.035 : 0/g, "index < 4 ? index * 0.04 : 0")
  .replace(/<motion\.article/g, "<article")
  .replace(/<\/motion\.article>/g, "</article>")
  .replace(/whileHover=\{\{ y: -4, scale: 1\.01 \}\}/g, "whileHover={reducedMotion ? undefined : { y: -4 }}")
  .replace(/whileTap=\{\{ scale: 0\.98 \}\}/g, "whileTap={reducedMotion ? undefined : { scale: 0.98 }}");

const patchedHandlers = handlerBlock
  .replace(/async function handleGenerateSummary\(\) \{[\s\S]*?setIsGeneratingSummary\(false\);\s*\}\s*\}/, "")
  .replace(/async function handleGenerateNotes\(\) \{[\s\S]*?setIsGeneratingNotes\(false\);\s*\}\s*\}/, "")
  .replace(/async function handleGenerateQuiz\(\) \{[\s\S]*?setIsGeneratingQuiz\(false\);\s*\}\s*\}/, "")
  .replace(/async function handleGenerateExplainer\(\) \{[\s\S]*?setIsGeneratingExplainer\(false\);\s*\}\s*\}/, "")
  .replace(
    /const visiblePreviewImages =[\s\S]*?const quizProgress =[\s\S]*?: 0;/,
    `const visiblePreviewImages =
    !showAllSlides
      ? previewData.previewImages.slice(0, 4)
      : previewData.previewImages;
  const activeQuizQuestion = aiQuiz?.questions[currentQuizQuestion] ?? null;
  const quizTotal = aiQuiz?.questions.length ?? 0;
  const quizScore = getQuizScore();
  const quizPercentage = quizTotal
    ? Math.round((quizScore / quizTotal) * 100)
    : 0;
  const quizProgress = quizTotal
    ? Math.round(((currentQuizQuestion + 1) / quizTotal) * 100)
    : 0;

  function mountAiPanels() {
    setAiPanelsMounted(true);
  }

  async function handleGenerateSummary() {
    mountAiPanels();
    setAiSummaryError("");
    setAiToast("");
    if (summaryRequestRef.current) return;
    const cacheKey = slideshareUrl.trim().toLowerCase();
    const cachedSummary = summaryCache[cacheKey];
    if (cachedSummary) {
      setAiSummary(cachedSummary);
      return;
    }
    summaryRequestRef.current = true;
    setIsGeneratingSummary(true);
    try {
      const response = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: slideshareUrl, title: previewData.title }),
      });
      const data = (await response.json()) as AiSummaryResponse;
      if (!response.ok || !data.summary) {
        setAiSummaryError(data.error ?? "Could not generate AI summary.");
        return;
      }
      setAiSummary(data.summary);
      setSummaryCache((current) => ({
        ...current,
        [cacheKey]: data.summary as AiPresentationSummary,
      }));
    } catch {
      setAiSummaryError("Could not generate AI summary. Please try again.");
    } finally {
      summaryRequestRef.current = false;
      setIsGeneratingSummary(false);
    }
  }

  async function handleGenerateNotes() {
    mountAiPanels();
    setAiNotesError("");
    setAiToast("");
    if (notesRequestRef.current) return;
    const cacheKey = slideshareUrl.trim().toLowerCase();
    const cachedNotes = notesCache[cacheKey];
    if (cachedNotes) {
      setAiNotes(cachedNotes);
      setAiToast("Loaded AI notes from temporary cache.");
      return;
    }
    notesRequestRef.current = true;
    setIsGeneratingNotes(true);
    try {
      const response = await fetch("/api/ai-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: slideshareUrl, title: previewData.title }),
      });
      const data = (await response.json()) as AiNotesResponse;
      if (!response.ok || !data.notes) {
        setAiNotesError(data.error ?? "Could not generate AI notes.");
        return;
      }
      setAiNotes(data.notes);
      setNotesCache((current) => ({
        ...current,
        [cacheKey]: data.notes as AiPresentationNotes,
      }));
    } catch {
      setAiNotesError("Could not generate AI notes. Please try again.");
    } finally {
      notesRequestRef.current = false;
      setIsGeneratingNotes(false);
    }
  }

  async function handleGenerateQuiz() {
    mountAiPanels();
    setAiQuizError("");
    setAiToast("");
    if (quizRequestRef.current) return;
    const cacheKey = slideshareUrl.trim().toLowerCase();
    const cachedQuiz = quizCache[cacheKey];
    if (cachedQuiz) {
      setAiQuiz(cachedQuiz);
      return;
    }
    quizRequestRef.current = true;
    setIsGeneratingQuiz(true);
    try {
      const response = await fetch("/api/ai-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: slideshareUrl, title: previewData.title }),
      });
      const data = (await response.json()) as AiQuizResponse;
      if (!response.ok || !data.quiz) {
        setAiQuizError(data.error ?? "Could not generate AI quiz.");
        return;
      }
      setAiQuiz(data.quiz);
      setQuizCache((current) => ({
        ...current,
        [cacheKey]: data.quiz as AiPresentationQuiz,
      }));
    } catch {
      setAiQuizError("Could not generate AI quiz. Please try again.");
    } finally {
      quizRequestRef.current = false;
      setIsGeneratingQuiz(false);
    }
  }

  async function handleGenerateExplainer() {
    mountAiPanels();
    setAiExplainerError("");
    setAiToast("");
    if (explainerRequestRef.current) return;
    const cacheKey = getExplainerCacheKey();
    const cachedExplainer = explainerCache[cacheKey];
    if (cachedExplainer) {
      setAiExplainer(cachedExplainer);
      return;
    }
    explainerRequestRef.current = true;
    setIsGeneratingExplainer(true);
    try {
      const response = await fetch("/api/ai-explainer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: slideshareUrl,
          title: previewData.title,
          mode: explainerMode,
        }),
      });
      const data = (await response.json()) as AiExplainerResponse;
      if (!response.ok || !data.explainer) {
        setAiExplainerError(data.error ?? "Could not generate AI explanation.");
        return;
      }
      setAiExplainer(data.explainer);
      setExplainerSuggestedQuestions(data.explainer.suggestedQuestions ?? []);
      setExplainerCache((current) => ({
        ...current,
        [cacheKey]: data.explainer as AiPresentationExplainer,
      }));
    } catch {
      setAiExplainerError("Could not generate AI explanation. Please try again.");
    } finally {
      explainerRequestRef.current = false;
      setIsGeneratingExplainer(false);
    }
  }`
  );

const footer = `
  return (
    <motion.div
      ref={previewRef}
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto mt-16 max-w-6xl sm:mt-20"
    >
${optimizedPreview}
    </motion.div>
  );
}
`;

fs.writeFileSync(outPath, header + patchedHandlers + footer);
console.log("Generated workspace:", outPath);
