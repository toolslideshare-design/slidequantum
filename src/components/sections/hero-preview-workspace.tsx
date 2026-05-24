"use client";

import {
  Bookmark,
  Bot,
  ChevronDown,
  ChevronUp,
  Copy,
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

  async function handleSavePresentation() {
    setAiToast("");

    if (!previewData?.previewImages.length) {
      setAiToast("Preview the presentation before saving it.");
      return;
    }

    setIsSavingPresentation(true);

    try {
      const response = await fetch("/api/user/saved-presentations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: previewData.title ?? "SlideShare Presentation",
          slideshareUrl,
          thumbnailUrl: previewData.previewImages[0],
        }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setAiToast(data.error ?? "Could not save this presentation.");
        return;
      }

      setAiToast("Presentation saved to your dashboard.");
    } catch {
      setAiToast("Could not save this presentation. Please try again.");
    } finally {
      setIsSavingPresentation(false);
    }
  }

  

  

  function formatNotes(notes: AiPresentationNotes) {
    return [
      "Study Notes",
      ...notes.studyNotes.map((note) => `- ${note}`),
      "",
      "Important Concepts",
      ...notes.importantConcepts.map((concept) => `- ${concept}`),
      "",
      "Quick Revision",
      notes.quickRevision,
    ].join("\n");
  }

  async function handleCopyNotes() {
    if (!aiNotes) return;

    await navigator.clipboard.writeText(formatNotes(aiNotes));
    setAiToast("AI notes copied to clipboard.");
  }

  function handleDownloadNotes() {
    if (!aiNotes) return;

    const blob = new Blob([formatNotes(aiNotes)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "slideshare-ai-notes.txt";
    link.click();
    URL.revokeObjectURL(url);
    setAiToast("AI notes download started.");
  }

  

  function resetQuizState() {
    setQuizStarted(false);
    setQuizCompleted(false);
    setCurrentQuizQuestion(0);
    setQuizAnswers({});
  }

  function getQuestionOptions(question: AiQuizQuestion) {
    if (question.type === "true_false") {
      return ["True", "False"];
    }

    return question.options;
  }

  function isAnswerCorrect(question: AiQuizQuestion, answer: string) {
    return (
      answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()
    );
  }

  function getQuizScore() {
    if (!aiQuiz) return 0;

    return aiQuiz.questions.reduce((score, question, index) => {
      const answer = quizAnswers[index];
      return answer && isAnswerCorrect(question, answer) ? score + 1 : score;
    }, 0);
  }

  function getQuizMessage(percentage: number) {
    if (percentage >= 85) return "Excellent work. You mastered this presentation.";
    if (percentage >= 60) return "Great progress. Review the missed points once more.";
    return "Good start. Try again after reviewing the notes.";
  }

  function formatQuiz(quiz: AiPresentationQuiz) {
    return quiz.questions
      .map((question, index) => {
        const options = getQuestionOptions(question);

        return [
          `${index + 1}. ${question.question}`,
          question.type === "mcq" ? "Type: Multiple Choice" : "",
          question.type === "true_false" ? "Type: True / False" : "",
          question.type === "short_answer" ? "Type: Short Answer" : "",
          ...options.map((option) => `- ${option}`),
          `Correct answer: ${question.correctAnswer}`,
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n\n");
  }

  async function handleCopyQuiz() {
    if (!aiQuiz) return;

    await navigator.clipboard.writeText(formatQuiz(aiQuiz));
    setAiToast("AI quiz copied to clipboard.");
  }

  function handleDownloadQuiz() {
    if (!aiQuiz) return;

    const blob = new Blob([formatQuiz(aiQuiz)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "slideshare-ai-quiz.txt";
    link.click();
    URL.revokeObjectURL(url);
    setAiToast("AI quiz download started.");
  }

  async function handleShareQuiz() {
    if (!aiQuiz) return;

    const text = formatQuiz(aiQuiz);

    if (navigator.share) {
      await navigator.share({
        title: "AI SlideShare Quiz",
        text,
      });
      return;
    }

    await navigator.clipboard.writeText(text);
    setAiToast("Sharing is not available here, so the quiz was copied.");
  }

  function getExplainerCacheKey(mode: AiExplainerMode = explainerMode) {
    return `${slideshareUrl.trim().toLowerCase()}::${mode}`;
  }

  function resetExplainerChat(explainer: AiPresentationExplainer) {
    setExplainerChatMessages([
      {
        role: "assistant",
        text: explainer.simpleExplanation,
      },
    ]);
    setExplainerSuggestedQuestions(explainer.suggestedQuestions);
    setExpandedExplainerSections({ 0: true });
  }

  async function handleGenerateExplainer(
    modeOverride?: AiExplainerMode,
    forceRefresh = false
  ) {
    setAiExplainerError("");
    setAiToast("");

    if (explainerRequestRef.current) {
      return;
    }

    const mode = modeOverride ?? explainerMode;
    const cacheKey = getExplainerCacheKey(mode);
    const cachedExplainer = !forceRefresh ? explainerCache[cacheKey] : undefined;

    if (cachedExplainer) {
      setExplainerMode(mode);
      setAiExplainer(cachedExplainer);
      resetExplainerChat(cachedExplainer);
      setAiToast("Loaded AI explanation from temporary cache.");
      return;
    }

    explainerRequestRef.current = true;
    setIsGeneratingExplainer(true);
    setExplainerMode(mode);

    try {
      const response = await fetch("/api/ai-explainer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: slideshareUrl,
          title: previewData.title,
          mode,
        }),
      });
      const data = (await response.json()) as AiExplainerResponse;

      if (!response.ok || !data.explainer) {
        setAiExplainerError(data.error ?? "Could not generate AI explanation.");
        return;
      }

      setAiExplainer(data.explainer);
      resetExplainerChat(data.explainer);
      setExplainerCache((current) => ({
        ...current,
        [cacheKey]: data.explainer as AiPresentationExplainer,
      }));
      setAiToast("AI explanation generated successfully.");
    } catch {
      setAiExplainerError("Could not generate AI explanation. Please try again.");
    } finally {
      explainerRequestRef.current = false;
      setIsGeneratingExplainer(false);
    }
  }

  async function handleExplainerModeChange(mode: AiExplainerMode) {
    if (mode === explainerMode && aiExplainer) {
      return;
    }

    setExplainerFollowUpInput("");
    await handleGenerateExplainer(mode);
  }

  async function handleExplainerFollowUp(question: string) {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || !previewData) {
      return;
    }

    setExplainerFollowUpInput("");
    setExplainerChatMessages((current) => [
      ...current,
      { role: "user", text: trimmedQuestion },
    ]);
    setIsExplainerFollowUpLoading(true);
    setAiExplainerError("");

    try {
      const response = await fetch("/api/ai-explainer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: slideshareUrl,
          title: previewData.title,
          mode: explainerMode,
          question: trimmedQuestion,
        }),
      });
      const data = (await response.json()) as AiExplainerResponse;

      if (!response.ok || !data.followUp) {
        setAiExplainerError(data.error ?? "Could not answer follow-up question.");
        return;
      }

      setExplainerChatMessages((current) => [
        ...current,
        { role: "assistant", text: data.followUp?.answer ?? "" },
      ]);
      setExplainerSuggestedQuestions(data.followUp.suggestedQuestions);
    } catch {
      setAiExplainerError("Could not answer follow-up question. Please try again.");
    } finally {
      setIsExplainerFollowUpLoading(false);
    }
  }

  function formatExplainer(explainer: AiPresentationExplainer) {
    return [
      "Simple Explanation",
      explainer.simpleExplanation,
      "",
      "Section-by-Section Explanation",
      ...explainer.sections.flatMap((section) => [
        `- ${section.title}`,
        section.explanation,
        "",
      ]),
      "Real World Meaning",
      explainer.realWorldMeaning,
      "",
      "Easy Learning Mode",
      explainer.easyLearningMode,
      "",
      "Voice Assistant Ready Text",
      explainer.ttsText,
    ].join("\n");
  }

  async function handleCopyExplainer() {
    if (!aiExplainer) return;

    await navigator.clipboard.writeText(formatExplainer(aiExplainer));
    setAiToast("AI explanation copied to clipboard.");
  }

  function handleSaveExplainer() {
    if (!aiExplainer) return;

    const storageKey = `slideshare-explainer-${getExplainerCacheKey()}`;
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        savedAt: new Date().toISOString(),
        mode: explainerMode,
        title: previewData?.title ?? "SlideShare Presentation",
        explainer: aiExplainer,
      })
    );
    setAiToast("AI explanation saved on this device.");
  }

  function handleDownloadExplainer() {
    if (!aiExplainer) return;

    const blob = new Blob([formatExplainer(aiExplainer)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "slideshare-ai-explanation.txt";
    link.click();
    URL.revokeObjectURL(url);
    setAiToast("AI explanation download started.");
  }

  const explainerModes: { id: AiExplainerMode; label: string }[] = [
    { id: "beginner", label: "Beginner Mode" },
    { id: "student", label: "Student Mode" },
    { id: "professional", label: "Professional Mode" },
  ];

  const visiblePreviewImages =
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

  async function handleGenerateSummary() {
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
    setAiQuizError("");
    setAiToast("");
    if (quizRequestRef.current) return;
    const cacheKey = slideshareUrl.trim().toLowerCase();
    const cachedQuiz = quizCache[cacheKey];
    if (cachedQuiz) {
      setAiQuiz(cachedQuiz);
      resetQuizState();
      setAiToast("Loaded AI quiz from temporary cache.");
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
      resetQuizState();
      setQuizCache((current) => ({
        ...current,
        [cacheKey]: data.quiz as AiPresentationQuiz,
      }));
      setAiToast("AI quiz generated successfully.");
    } catch {
      setAiQuizError("Could not generate AI quiz. Please try again.");
    } finally {
      quizRequestRef.current = false;
      setIsGeneratingQuiz(false);
    }
  }

  return (
    <motion.div
      ref={previewRef}
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto mt-16 max-w-6xl sm:mt-20"
    >
              <div className="glass-card glow-border relative overflow-hidden rounded-3xl p-5 shadow-[0_0_90px_-50px_rgba(249,115,22,0.95)] sm:p-8">
                <div className="pointer-events-none absolute left-1/2 top-0 h-56 w-96 -translate-x-1/2 rounded-full bg-orange-500/15 blur-2xl" aria-hidden />

                <div className="relative">
                  <div className="mb-8 flex flex-col gap-5 text-center md:flex-row md:items-end md:justify-between md:text-left">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">
                        Live Preview
                      </p>
                      <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                        Live Preview Slides
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                        Preview your SlideShare presentation before downloading
                      </p>
                      {previewData.title && (
                        <p className="mt-2 text-sm font-medium text-orange-200">
                          {previewData.title}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row md:items-center">
                      <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm text-orange-300">
                        {previewData.slideCount} slides found
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {(["PPT", "PDF"] as const).map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setFormat(item)}
                            className={cn(
                              "rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-300",
                              format === item
                                ? "border-orange-500/50 bg-orange-500/15 text-orange-300 shadow-[0_0_30px_-12px_rgba(249,115,22,0.8)]"
                                : "border-white/10 bg-white/5 text-muted-foreground hover:border-orange-500/30 hover:text-foreground"
                            )}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleSavePresentation}
                        disabled={isSavingPresentation}
                      >
                        {isSavingPresentation ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Bookmark className="size-4" />
                        )}
                        Save Presentation
                      </Button>
                    </div>
                  </div>

                  <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
                    {visiblePreviewImages.map((imageUrl, index) => (
                      <article
                        key={`${imageUrl}-${index}`}
                        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/35 p-2 transition-transform duration-300 hover:-translate-y-1 hover:border-orange-500/45 hover:shadow-[0_0_45px_-18px_rgba(249,115,22,0.8)]"
                      >
                          <div className="relative aspect-video overflow-hidden rounded-xl bg-zinc-950">
                            {!loadedImages[index] && (
                              <div className="skeleton-shimmer absolute inset-0 z-10 bg-gradient-to-br from-white/10 via-white/5 to-orange-500/10" />
                            )}
                            <RemoteImage
                              src={imageUrl}
                              alt={`Slide preview ${index + 1}`}
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                              priority={index < 2}
                              onLoad={() =>
                                setLoadedImages((current) => ({
                                  ...current,
                                  [index]: true,
                                }))
                              }
                              className={cn(
                                "transition duration-700 group-hover:scale-110",
                                loadedImages[index] ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <span className="absolute left-3 top-3 z-20 rounded-full border border-orange-500/30 bg-black/65 px-2.5 py-1 text-xs font-semibold text-orange-200 backdrop-blur">
                              Slide {index + 1}
                            </span>
                          </div>
                        </article>
                      ))}
                  </div>

                  {previewData.previewImages.length > 4 && !showAllSlides && (
                    <div className="mt-8 flex justify-center">
                      <Button variant="secondary" onClick={() => setShowAllSlides(true)}>
                        Show More Slides
                      </Button>
                    </div>
                  )}

                  <section className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-black/25 p-4 sm:p-6">
                    <div className="mb-6 flex flex-col gap-4 text-center md:flex-row md:items-end md:justify-between md:text-left">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">
                          AI Tools
                        </p>
                        <h3 className="mt-2 text-2xl font-bold tracking-tight">
                          AI Tools
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Use AI to understand and study presentations faster.
                        </p>
                      </div>
                      {aiToast && (
                        <motion.p
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-xs font-semibold text-orange-200"
                        >
                          {aiToast}
                        </motion.p>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <motion.button
                        type="button"
                        whileHover={reducedMotion ? undefined : { y: -4 }}
                        whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                        onClick={handleGenerateSummary}
                        disabled={isGeneratingSummary}
                        className="glow-border rounded-2xl border border-orange-500/20 bg-orange-500/10 p-5 text-left transition-all hover:border-orange-500/45 hover:shadow-[0_0_50px_-24px_rgba(249,115,22,0.9)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span className="flex size-10 items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/15 text-orange-300">
                          {isGeneratingSummary ? (
                            <Loader2 className="size-5 animate-spin" />
                          ) : (
                            <Sparkles className="size-5" />
                          )}
                        </span>
                        <h4 className="mt-4 font-semibold">Generate AI Summary</h4>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Create a short overview, key points, and topic chips.
                        </p>
                      </motion.button>

                      <motion.button
                        type="button"
                        whileHover={reducedMotion ? undefined : { y: -4 }}
                        whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                        onClick={handleGenerateNotes}
                        disabled={isGeneratingNotes}
                        className="glow-border rounded-2xl border border-orange-500/20 bg-white/[0.04] p-5 text-left transition-all hover:border-orange-500/45 hover:shadow-[0_0_50px_-24px_rgba(249,115,22,0.9)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span className="flex size-10 items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/15 text-orange-300">
                          {isGeneratingNotes ? (
                            <Loader2 className="size-5 animate-spin" />
                          ) : (
                            <NotebookText className="size-5" />
                          )}
                        </span>
                        <h4 className="mt-4 font-semibold">Generate AI Notes</h4>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Convert the presentation into study notes and revision points.
                        </p>
                      </motion.button>

                      <motion.button
                        type="button"
                        whileHover={reducedMotion ? undefined : { y: -4 }}
                        whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                        onClick={handleGenerateQuiz}
                        disabled={isGeneratingQuiz}
                        className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-5 text-left opacity-75 transition-all hover:border-orange-500/45 hover:opacity-100 hover:shadow-[0_0_50px_-24px_rgba(249,115,22,0.9)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span className="flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-muted-foreground">
                          {isGeneratingQuiz ? (
                            <Loader2 className="size-5 animate-spin" />
                          ) : (
                            <Sparkles className="size-5" />
                          )}
                        </span>
                        <h4 className="mt-4 font-semibold">AI Quiz Generator</h4>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Generate MCQs, true / false, and short answer questions.
                        </p>
                      </motion.button>

                      <motion.button
                        type="button"
                        whileHover={reducedMotion ? undefined : { y: -4 }}
                        whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                        onClick={() => handleGenerateExplainer()}
                        disabled={isGeneratingExplainer}
                        className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-5 text-left opacity-75 transition-all hover:border-orange-500/45 hover:opacity-100 hover:shadow-[0_0_50px_-24px_rgba(249,115,22,0.9)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span className="flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-muted-foreground">
                          {isGeneratingExplainer ? (
                            <Loader2 className="size-5 animate-spin" />
                          ) : (
                            <Bot className="size-5" />
                          )}
                        </span>
                        <h4 className="mt-4 font-semibold">AI Presentation Explainer</h4>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Explain the presentation like a teacher with follow-up chat.
                        </p>
                      </motion.button>
                    </div>

                  <AnimatePresence mode="wait">
                    {isGeneratingSummary && (
                      <motion.div
                        key="ai-summary-loading"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="mt-8 overflow-hidden rounded-3xl border border-orange-500/20 bg-orange-500/10 p-5 shadow-[0_0_80px_-45px_rgba(249,115,22,0.9)] backdrop-blur"
                      >
                        <div className="mb-5 flex items-center gap-3 text-orange-100">
                          <span className="flex size-10 items-center justify-center rounded-2xl border border-orange-500/25 bg-orange-500/15">
                            <Sparkles className="size-5 animate-pulse" />
                          </span>
                          <div>
                            <p className="font-semibold">Generating AI insights...</p>
                            <p className="text-sm text-orange-100/70">
                              Reading available slide text and preparing summary.
                            </p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="skeleton-shimmer h-4 rounded-full bg-white/10" />
                          <div className="skeleton-shimmer h-4 w-5/6 rounded-full bg-white/10" />
                          <div className="skeleton-shimmer h-4 w-2/3 rounded-full bg-white/10" />
                        </div>
                        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                            animate={{ x: ["-45%", "110%"] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                            style={{ width: "45%" }}
                          />
                        </div>
                      </motion.div>
                    )}

                    {aiSummaryError && !isGeneratingSummary && (
                      <motion.div
                        key="ai-summary-error"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="mt-8 rounded-3xl border border-red-500/30 bg-red-500/10 p-5 text-red-100 shadow-[0_0_60px_-35px_rgba(248,113,113,0.8)]"
                      >
                        <p className="font-semibold">AI summary failed</p>
                        <p className="mt-2 text-sm text-red-100/80">{aiSummaryError}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-4 border-red-500/30 text-red-100 hover:border-red-500/60"
                          onClick={handleGenerateSummary}
                        >
                          <RefreshCcw className="size-4" />
                          Retry
                        </Button>
                      </motion.div>
                    )}

                    {aiSummary && !isGeneratingSummary && !aiSummaryError && (
                      <motion.div
                        key="ai-summary-card"
                        initial={{ opacity: 0, y: 24, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, scale: 0.98 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        className="glow-border mt-8 overflow-hidden rounded-3xl border border-orange-500/25 bg-black/35 p-5 shadow-[0_0_90px_-45px_rgba(249,115,22,0.95)] backdrop-blur-xl sm:p-6"
                      >
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/5" />
                        <div className="relative">
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="flex items-start gap-3">
                              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/15 text-orange-300 shadow-[0_0_35px_-15px_rgba(249,115,22,0.9)]">
                                <Sparkles className="size-5" />
                              </span>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">
                                  AI Presentation Summary
                                </p>
                                <h3 className="mt-2 text-2xl font-bold tracking-tight">
                                  AI Presentation Summary
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                  Understand the presentation instantly with AI-generated insights.
                                </p>
                              </div>
                            </div>
                            <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-300">
                              Cached for this session
                            </span>
                          </div>

                          <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                              <h4 className="font-semibold text-orange-100">Short Summary</h4>
                              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                <TypewriterText text={aiSummary.shortSummary} />
                              </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                              <h4 className="font-semibold text-orange-100">Main Topics</h4>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {aiSummary.mainTopics.map((topic) => (
                                  <span
                                    key={topic}
                                    className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-200"
                                  >
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-5">
                            <h4 className="font-semibold text-orange-100">Key Points</h4>
                            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                              {aiSummary.keyPoints.map((point, index) => (
                                <motion.li
                                  key={`${point}-${index}`}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                                >
                                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-orange-400 shadow-[0_0_14px_rgba(249,115,22,0.8)]" />
                                  {point}
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence mode="wait">
                    {isGeneratingNotes && (
                      <motion.div
                        key="ai-notes-loading"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="mt-8 overflow-hidden rounded-3xl border border-orange-500/20 bg-orange-500/10 p-5 shadow-[0_0_80px_-45px_rgba(249,115,22,0.9)] backdrop-blur"
                      >
                        <div className="mb-5 flex items-center gap-3 text-orange-100">
                          <span className="flex size-10 items-center justify-center rounded-2xl border border-orange-500/25 bg-orange-500/15">
                            <NotebookText className="size-5 animate-pulse" />
                          </span>
                          <div>
                            <p className="font-semibold">Generating AI study notes...</p>
                            <p className="text-sm text-orange-100/70">
                              Creating bullet notes, concepts, and quick revision material.
                            </p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="skeleton-shimmer h-4 rounded-full bg-white/10" />
                          <div className="skeleton-shimmer h-4 w-4/5 rounded-full bg-white/10" />
                          <div className="skeleton-shimmer h-4 w-3/5 rounded-full bg-white/10" />
                        </div>
                      </motion.div>
                    )}

                    {aiNotesError && !isGeneratingNotes && (
                      <motion.div
                        key="ai-notes-error"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="mt-8 rounded-3xl border border-red-500/30 bg-red-500/10 p-5 text-red-100 shadow-[0_0_60px_-35px_rgba(248,113,113,0.8)]"
                      >
                        <p className="font-semibold">AI notes failed</p>
                        <p className="mt-2 text-sm text-red-100/80">{aiNotesError}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-4 border-red-500/30 text-red-100 hover:border-red-500/60"
                          onClick={handleGenerateNotes}
                        >
                          <RefreshCcw className="size-4" />
                          Retry
                        </Button>
                      </motion.div>
                    )}

                    {aiNotes && !isGeneratingNotes && !aiNotesError && (
                      <motion.div
                        key="ai-notes-card"
                        initial={{ opacity: 0, y: 24, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, scale: 0.98 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        className="glow-border mt-8 overflow-hidden rounded-3xl border border-orange-500/25 bg-black/35 p-5 shadow-[0_0_90px_-45px_rgba(249,115,22,0.95)] backdrop-blur-xl sm:p-6"
                      >
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.08)_1px,transparent_1px)] bg-[length:100%_32px]" />
                        <div className="relative">
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="flex items-start gap-3">
                              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/15 text-orange-300 shadow-[0_0_35px_-15px_rgba(249,115,22,0.9)]">
                                <NotebookText className="size-5" />
                              </span>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">
                                  AI Notes Generator
                                </p>
                                <h3 className="mt-2 text-2xl font-bold tracking-tight">
                                  AI Study Notes
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                  Study notes, important concepts, and quick revision material.
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button type="button" variant="secondary" size="sm" onClick={handleCopyNotes}>
                                <Copy className="size-4" />
                                Copy Notes
                              </Button>
                              <Button type="button" variant="outline" size="sm" onClick={handleDownloadNotes}>
                                <FileDown className="size-4" />
                                Download Notes
                              </Button>
                            </div>
                          </div>

                          <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                              <h4 className="font-semibold text-orange-100">Study Notes</h4>
                              <ul className="mt-3 space-y-3">
                                {aiNotes.studyNotes.map((note, index) => (
                                  <motion.li
                                    key={`${note}-${index}`}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                    className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                                  >
                                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-orange-400 shadow-[0_0_14px_rgba(249,115,22,0.8)]" />
                                    {note}
                                  </motion.li>
                                ))}
                              </ul>
                            </div>

                            <div className="space-y-5">
                              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                                <h4 className="font-semibold text-orange-100">Important Concepts</h4>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {aiNotes.importantConcepts.map((concept) => (
                                    <span
                                      key={concept}
                                      className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-200"
                                    >
                                      {concept}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                                <h4 className="font-semibold text-orange-100">Quick Revision</h4>
                                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                  <TypewriterText text={aiNotes.quickRevision} />
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence mode="wait">
                    {isGeneratingQuiz && (
                      <motion.div
                        key="ai-quiz-loading"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="mt-8 overflow-hidden rounded-3xl border border-orange-500/20 bg-orange-500/10 p-5 shadow-[0_0_80px_-45px_rgba(249,115,22,0.9)] backdrop-blur"
                      >
                        <div className="mb-5 flex items-center gap-3 text-orange-100">
                          <span className="flex size-10 items-center justify-center rounded-2xl border border-orange-500/25 bg-orange-500/15">
                            <Sparkles className="size-5 animate-pulse" />
                          </span>
                          <div>
                            <p className="font-semibold">Generating AI quiz...</p>
                            <p className="text-sm text-orange-100/70">
                              Creating MCQs, true / false, and short answer questions.
                            </p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="skeleton-shimmer h-4 rounded-full bg-white/10" />
                          <div className="skeleton-shimmer h-4 w-4/5 rounded-full bg-white/10" />
                          <div className="skeleton-shimmer h-4 w-2/3 rounded-full bg-white/10" />
                        </div>
                      </motion.div>
                    )}

                    {aiQuizError && !isGeneratingQuiz && (
                      <motion.div
                        key="ai-quiz-error"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="mt-8 rounded-3xl border border-red-500/30 bg-red-500/10 p-5 text-red-100 shadow-[0_0_60px_-35px_rgba(248,113,113,0.8)]"
                      >
                        <p className="font-semibold">AI quiz failed</p>
                        <p className="mt-2 text-sm text-red-100/80">{aiQuizError}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-4 border-red-500/30 text-red-100 hover:border-red-500/60"
                          onClick={handleGenerateQuiz}
                        >
                          <RefreshCcw className="size-4" />
                          Retry
                        </Button>
                      </motion.div>
                    )}

                    {aiQuiz && activeQuizQuestion && !isGeneratingQuiz && !aiQuizError && (
                      <motion.div
                        key="ai-quiz-card"
                        initial={{ opacity: 0, y: 24, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, scale: 0.98 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        className="glow-border mt-8 overflow-hidden rounded-3xl border border-orange-500/25 bg-black/35 p-5 shadow-[0_0_90px_-45px_rgba(249,115,22,0.95)] backdrop-blur-xl sm:p-6"
                      >
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/5" />
                        <div className="relative">
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="flex items-start gap-3">
                              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/15 text-orange-300 shadow-[0_0_35px_-15px_rgba(249,115,22,0.9)]">
                                <Sparkles className="size-5" />
                              </span>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">
                                  AI Quiz Generator
                                </p>
                                <h3 className="mt-2 text-2xl font-bold tracking-tight">
                                  Interactive AI Quiz
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                  Answer generated questions and check your understanding.
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button type="button" variant="secondary" size="sm" onClick={handleCopyQuiz}>
                                <Copy className="size-4" />
                                Copy Quiz
                              </Button>
                              <Button type="button" variant="outline" size="sm" onClick={handleDownloadQuiz}>
                                <FileDown className="size-4" />
                                Download Quiz
                              </Button>
                              <Button type="button" variant="outline" size="sm" onClick={handleShareQuiz}>
                                <Share2 className="size-4" />
                                Share Quiz
                              </Button>
                            </div>
                          </div>

                          {!quizStarted && !quizCompleted && (
                            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5 text-center">
                              <p className="text-sm text-muted-foreground">
                                {quizTotal} questions are ready: MCQs, true / false, and short answer.
                              </p>
                              <Button
                                type="button"
                                className="mt-5"
                                onClick={() => setQuizStarted(true)}
                              >
                                <Sparkles className="size-4" />
                                Start Quiz
                              </Button>
                            </div>
                          )}

                          {quizStarted && !quizCompleted && (
                            <div className="mt-6">
                              <div className="mb-5 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                                    Progress
                                  </p>
                                  <p className="mt-1 font-semibold text-orange-100">
                                    {currentQuizQuestion + 1} / {quizTotal}
                                  </p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                                    Score
                                  </p>
                                  <p className="mt-1 font-semibold text-orange-100">
                                    {quizScore} correct
                                  </p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                                    Type
                                  </p>
                                  <p className="mt-1 font-semibold text-orange-100">
                                    {activeQuizQuestion.type === "mcq"
                                      ? "MCQ"
                                      : activeQuizQuestion.type === "true_false"
                                        ? "True / False"
                                        : "Short Answer"}
                                  </p>
                                </div>
                              </div>

                              <div className="mb-6 h-2 overflow-hidden rounded-full bg-white/10">
                                <motion.div
                                  className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${quizProgress}%` }}
                                  transition={{ duration: 0.35 }}
                                />
                              </div>

                              <motion.div
                                key={currentQuizQuestion}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-3xl border border-white/10 bg-black/30 p-5"
                              >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">
                                      Question {currentQuizQuestion + 1}
                                    </p>
                                    <h4 className="mt-2 text-xl font-semibold leading-snug text-orange-50">
                                      {activeQuizQuestion.question}
                                    </h4>
                                  </div>
                                  {quizAnswers[currentQuizQuestion] && (
                                    <span
                                      className={cn(
                                        "rounded-full border px-3 py-1.5 text-xs font-semibold",
                                        isAnswerCorrect(
                                          activeQuizQuestion,
                                          quizAnswers[currentQuizQuestion]
                                        )
                                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                                          : "border-red-500/30 bg-red-500/10 text-red-200"
                                      )}
                                    >
                                      {isAnswerCorrect(
                                        activeQuizQuestion,
                                        quizAnswers[currentQuizQuestion]
                                      )
                                        ? "Correct"
                                        : "Wrong"}
                                    </span>
                                  )}
                                </div>

                                {activeQuizQuestion.type === "short_answer" ? (
                                  <div className="mt-5">
                                    <input
                                      type="text"
                                      value={quizAnswers[currentQuizQuestion] ?? ""}
                                      onChange={(event) =>
                                        setQuizAnswers((current) => ({
                                          ...current,
                                          [currentQuizQuestion]: event.target.value,
                                        }))
                                      }
                                      placeholder="Type your short answer"
                                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                                    />
                                    {quizAnswers[currentQuizQuestion] && (
                                      <p className="mt-3 text-sm text-muted-foreground">
                                        Correct answer:{" "}
                                        <span className="font-semibold text-orange-200">
                                          {activeQuizQuestion.correctAnswer}
                                        </span>
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    {getQuestionOptions(activeQuizQuestion).map((option) => {
                                      const selected =
                                        quizAnswers[currentQuizQuestion] === option;
                                      const answered = Boolean(quizAnswers[currentQuizQuestion]);
                                      const correct = isAnswerCorrect(
                                        activeQuizQuestion,
                                        option
                                      );

                                      return (
                                        <motion.button
                                          key={option}
                                          type="button"
                                          whileHover={{ scale: 1.01 }}
                                          whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                                          onClick={() =>
                                            setQuizAnswers((current) => ({
                                              ...current,
                                              [currentQuizQuestion]: option,
                                            }))
                                          }
                                          className={cn(
                                            "rounded-2xl border p-4 text-left text-sm transition-all",
                                            selected
                                              ? "border-orange-500/60 bg-orange-500/15 text-orange-100 shadow-[0_0_35px_-18px_rgba(249,115,22,0.9)]"
                                              : "border-white/10 bg-white/[0.04] text-muted-foreground hover:border-orange-500/35 hover:text-orange-100",
                                            answered && correct
                                              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-100"
                                              : "",
                                            answered && selected && !correct
                                              ? "border-red-500/50 bg-red-500/10 text-red-100"
                                              : ""
                                          )}
                                        >
                                          {option}
                                        </motion.button>
                                      );
                                    })}
                                  </div>
                                )}

                                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    disabled={currentQuizQuestion === 0}
                                    onClick={() =>
                                      setCurrentQuizQuestion((current) =>
                                        Math.max(0, current - 1)
                                      )
                                    }
                                  >
                                    Previous Question
                                  </Button>
                                  {currentQuizQuestion + 1 < quizTotal ? (
                                    <Button
                                      type="button"
                                      onClick={() =>
                                        setCurrentQuizQuestion((current) =>
                                          Math.min(quizTotal - 1, current + 1)
                                        )
                                      }
                                    >
                                      Next Question
                                    </Button>
                                  ) : (
                                    <Button
                                      type="button"
                                      onClick={() => setQuizCompleted(true)}
                                    >
                                      Finish Quiz
                                    </Button>
                                  )}
                                </div>
                              </motion.div>
                            </div>
                          )}

                          {quizCompleted && (
                            <motion.div
                              initial={{ opacity: 0, y: 16, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              className="mt-6 rounded-3xl border border-orange-500/25 bg-orange-500/10 p-6 text-center shadow-[0_0_70px_-35px_rgba(249,115,22,0.9)]"
                            >
                              <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">
                                Quiz Complete
                              </p>
                              <h4 className="mt-3 text-3xl font-bold text-orange-50">
                                {quizScore} / {quizTotal}
                              </h4>
                              <p className="mt-2 text-lg font-semibold text-orange-200">
                                {quizPercentage}% Score
                              </p>
                              <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
                                {getQuizMessage(quizPercentage)}
                              </p>
                              <Button
                                type="button"
                                className="mt-5"
                                onClick={() => {
                                  resetQuizState();
                                  setQuizStarted(true);
                                }}
                              >
                                <RefreshCcw className="size-4" />
                                Retry Quiz
                              </Button>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence mode="wait">
                    {isGeneratingExplainer && (
                      <motion.div
                        key="ai-explainer-loading"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="mt-8 overflow-hidden rounded-3xl border border-orange-500/20 bg-orange-500/10 p-5 shadow-[0_0_80px_-45px_rgba(249,115,22,0.9)] backdrop-blur"
                      >
                        <div className="mb-5 flex items-center gap-3 text-orange-100">
                          <span className="flex size-10 items-center justify-center rounded-2xl border border-orange-500/25 bg-orange-500/15">
                            <Bot className="size-5 animate-pulse" />
                          </span>
                          <div>
                            <p className="font-semibold">Generating AI explanation...</p>
                            <p className="text-sm text-orange-100/70">
                              Acting like a teacher and preparing simple explanations.
                            </p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="skeleton-shimmer h-4 rounded-full bg-white/10" />
                          <div className="skeleton-shimmer h-4 w-4/5 rounded-full bg-white/10" />
                          <div className="skeleton-shimmer h-4 w-3/5 rounded-full bg-white/10" />
                        </div>
                      </motion.div>
                    )}

                    {aiExplainerError && !isGeneratingExplainer && (
                      <motion.div
                        key="ai-explainer-error"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="mt-8 rounded-3xl border border-red-500/30 bg-red-500/10 p-5 text-red-100 shadow-[0_0_60px_-35px_rgba(248,113,113,0.8)]"
                      >
                        <p className="font-semibold">AI explainer failed</p>
                        <p className="mt-2 text-sm text-red-100/80">{aiExplainerError}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-4 border-red-500/30 text-red-100 hover:border-red-500/60"
                          onClick={() => handleGenerateExplainer(undefined, true)}
                        >
                          <RefreshCcw className="size-4" />
                          Retry
                        </Button>
                      </motion.div>
                    )}

                    {aiExplainer && !isGeneratingExplainer && !aiExplainerError && (
                      <motion.div
                        ref={explainerRef}
                        key="ai-explainer-card"
                        initial={{ opacity: 0, y: 24, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, scale: 0.98 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        className="glow-border mt-8 overflow-hidden rounded-3xl border border-orange-500/25 bg-black/35 p-5 shadow-[0_0_90px_-45px_rgba(249,115,22,0.95)] backdrop-blur-xl sm:p-6"
                      >
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/5" />
                        <div className="relative">
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="flex items-start gap-3">
                              <motion.span
                                animate={{
                                  boxShadow: [
                                    "0 0 20px rgba(249,115,22,0.35)",
                                    "0 0 40px rgba(249,115,22,0.65)",
                                    "0 0 20px rgba(249,115,22,0.35)",
                                  ],
                                }}
                                transition={{ duration: 2.4, repeat: Infinity }}
                                className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/15 text-orange-300"
                              >
                                <Bot className="size-5" />
                              </motion.span>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">
                                  AI Presentation Explainer
                                </p>
                                <h3 className="mt-2 text-2xl font-bold tracking-tight">
                                  Interactive AI Tutor
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                  Simple explanations, section breakdowns, and follow-up chat.
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={handleCopyExplainer}
                              >
                                <Copy className="size-4" />
                                Copy Explanation
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleSaveExplainer}
                              >
                                <Bookmark className="size-4" />
                                Save Explanation
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadExplainer}
                              >
                                <FileDown className="size-4" />
                                Download Notes
                              </Button>
                            </div>
                          </div>

                          <div className="mt-5 flex flex-wrap gap-2">
                            {explainerModes.map((mode) => (
                              <button
                                key={mode.id}
                                type="button"
                                onClick={() => handleExplainerModeChange(mode.id)}
                                disabled={isGeneratingExplainer || isExplainerFollowUpLoading}
                                className={cn(
                                  "rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-300",
                                  explainerMode === mode.id
                                    ? "border-orange-500/50 bg-orange-500/15 text-orange-300 shadow-[0_0_30px_-12px_rgba(249,115,22,0.8)]"
                                    : "border-white/10 bg-white/5 text-muted-foreground hover:border-orange-500/30 hover:text-foreground"
                                )}
                              >
                                {mode.label}
                              </button>
                            ))}
                          </div>

                          <div className="mt-6 max-h-[min(420px,60vh)] space-y-4 overflow-y-auto overscroll-contain rounded-3xl border border-white/10 bg-black/30 p-4 sm:max-h-[520px] sm:p-5">
                            {explainerChatMessages.map((message, index) => (
                              <motion.div
                                key={`${message.role}-${index}-${message.text.slice(0, 24)}`}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className={cn(
                                  "flex",
                                  message.role === "user" ? "justify-end" : "justify-start"
                                )}
                              >
                                <div
                                  className={cn(
                                    "max-w-[92%] rounded-2xl border px-4 py-3 text-sm leading-relaxed shadow-lg sm:max-w-[80%]",
                                    message.role === "user"
                                      ? "border-orange-500/30 bg-orange-500/15 text-orange-100"
                                      : "border-white/10 bg-white/[0.04] text-muted-foreground"
                                  )}
                                >
                                  {message.role === "assistant" && index === 0 ? (
                                    <TypewriterText text={message.text} />
                                  ) : (
                                    message.text
                                  )}
                                </div>
                              </motion.div>
                            ))}

                            {isExplainerFollowUpLoading && (
                              <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-start"
                              >
                                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                                  <div className="flex items-center gap-1.5">
                                    {[0, 1, 2].map((dot) => (
                                      <motion.span
                                        key={dot}
                                        className="size-2 rounded-full bg-orange-400"
                                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                                        transition={{
                                          duration: 0.9,
                                          repeat: Infinity,
                                          delay: dot * 0.15,
                                        }}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>

                          <div className="mt-5 grid gap-4 lg:grid-cols-2">
                            {aiExplainer.sections.map((section, index) => {
                              const expanded = expandedExplainerSections[index] ?? false;

                              return (
                                <motion.div
                                  key={`${section.title}-${index}`}
                                  className="rounded-2xl border border-white/10 bg-black/30"
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedExplainerSections((current) => ({
                                        ...current,
                                        [index]: !expanded,
                                      }))
                                    }
                                    className="flex w-full items-center justify-between gap-3 p-4 text-left"
                                  >
                                    <div>
                                      <p className="text-xs uppercase tracking-wider text-orange-400">
                                        Section {index + 1}
                                      </p>
                                      <h4 className="mt-1 font-semibold text-orange-100">
                                        {section.title}
                                      </h4>
                                    </div>
                                    {expanded ? (
                                      <ChevronUp className="size-4 text-orange-300" />
                                    ) : (
                                      <ChevronDown className="size-4 text-orange-300" />
                                    )}
                                  </button>
                                  <AnimatePresence initial={false}>
                                    {expanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                      >
                                        <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">
                                          {section.explanation}
                                        </p>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.div>
                              );
                            })}
                          </div>

                          <div className="mt-5 grid gap-4 lg:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                              <h4 className="font-semibold text-orange-100">
                                Real World Meaning
                              </h4>
                              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                {aiExplainer.realWorldMeaning}
                              </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                              <h4 className="font-semibold text-orange-100">
                                Easy Learning Mode
                              </h4>
                              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                {aiExplainer.easyLearningMode}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">
                              Ask a follow-up
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {explainerSuggestedQuestions.map((question) => (
                                <button
                                  key={question}
                                  type="button"
                                  onClick={() => handleExplainerFollowUp(question)}
                                  disabled={isExplainerFollowUpLoading}
                                  className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-200 transition hover:border-orange-500/45 hover:shadow-[0_0_25px_-12px_rgba(249,115,22,0.9)] disabled:opacity-60"
                                >
                                  {question}
                                </button>
                              ))}
                            </div>
                            <form
                              className="mt-4 flex gap-2"
                              onSubmit={(event) => {
                                event.preventDefault();
                                handleExplainerFollowUp(explainerFollowUpInput);
                              }}
                            >
                              <input
                                type="text"
                                value={explainerFollowUpInput}
                                onChange={(event) =>
                                  setExplainerFollowUpInput(event.target.value)
                                }
                                placeholder="Ask: Explain this more simply..."
                                className="flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                              />
                              <Button
                                type="submit"
                                disabled={
                                  isExplainerFollowUpLoading ||
                                  !explainerFollowUpInput.trim()
                                }
                              >
                                <Send className="size-4" />
                              </Button>
                            </form>
                          </div>

                          <p
                            className="sr-only"
                            aria-live="polite"
                            data-tts-ready={aiExplainer.ttsText}
                          >
                            {aiExplainer.ttsText}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  </section>

                  <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="mb-3 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Conversion status</span>
                      <span className="text-orange-300">
                        {isLoading ? "Generating..." : "Ready"}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                        animate={{
                          width: isLoading ? ["20%", "85%", "45%"] : "100%",
                        }}
                        transition={{
                          duration: isLoading ? 1.4 : 0.4,
                          repeat: isLoading ? Infinity : 0,
                          ease: "easeInOut",
                        }}
                      />
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="pulse-glow mt-5 w-full"
                    onClick={handleDownload}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <FileText className="size-5" />
                    )}
                    Generate File
                  </Button>
                </div>
              </div>
    </motion.div>
  );
}
