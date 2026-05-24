"use client";

import dynamic from "next/dynamic";
import {
  CheckCircle2,
  Download,
  Eye,
  Link2,
  Loader2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { HomepageContentData } from "@/types/content";
import { fadeUp } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { HeroPreviewSkeleton } from "@/components/sections/hero-preview-skeleton";
import type { PreviewData } from "@/components/sections/hero-preview-workspace";

const HeroPreviewWorkspace = dynamic(
  () =>
    import("@/components/sections/hero-preview-workspace").then(
      (module) => module.HeroPreviewWorkspace
    ),
  {
    loading: () => <HeroPreviewSkeleton />,
    ssr: false,
  }
);

type HeroProps = {
  content: HomepageContentData["heroContent"];
};

type DownloadResult = {
  success?: boolean;
  downloadUrl?: string | null;
  message?: string;
  error?: string;
  slideCount?: number;
  title?: string;
};

export function Hero({ content }: HeroProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [slideshareUrl, setSlideshareUrl] = useState("");
  const [format, setFormat] = useState<"PPT" | "PDF">("PDF");
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DownloadResult | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  async function handleDownload() {
    setResult(null);
    setError("");

    if (!slideshareUrl.trim()) {
      setError("Please paste a SlideShare URL first.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: slideshareUrl, format }),
      });
      const data = (await response.json()) as DownloadResult;

      if (!response.ok) {
        setError(data.error ?? "Download request failed.");
        return;
      }

      setResult(data);
      setShowConfetti(true);
      window.setTimeout(() => setShowConfetti(false), 1200);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePreview() {
    setResult(null);
    setError("");
    setShowPreview(false);
    setPreviewData(null);

    if (!slideshareUrl.trim()) {
      setError("Please paste a SlideShare URL first.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: slideshareUrl, format, preview: true }),
      });
      const data = (await response.json()) as DownloadResult & PreviewData;

      if (!response.ok || !data.previewImages?.length) {
        setError(data.error ?? "No preview data was found for this URL.");
        return;
      }

      setPreviewData({
        previewImages: data.previewImages,
        slideCount: data.slideCount ?? data.previewImages.length,
        message: data.message,
        title: data.title ?? "SlideShare Presentation",
      });
      setShowPreview(true);
    } catch {
      setError("Could not fetch preview data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="hero-section relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div className="pointer-events-none absolute inset-0 hero-ambient" aria-hidden />

      <Container className="relative">
        <motion.div
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-4xl text-center"
        >
          <div className="mx-auto">
            <motion.div
              custom={0}
              variants={fadeUp}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm text-orange-300 backdrop-blur-sm"
            >
              <CheckCircle2 className="size-4" />
              {content.badge}
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              className="mx-auto max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl"
            >
              {content.headline}
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl"
            >
              {content.subtitle}
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeUp}
              className="mx-auto mt-10 max-w-2xl text-left"
            >
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-card/70 p-3 shadow-[0_0_60px_-32px_rgba(249,115,22,0.85)] backdrop-blur-xl sm:p-4">
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-orange-500/8 to-transparent"
                  aria-hidden
                />
                <div className="relative flex flex-col gap-3">
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/35 px-3.5 py-3.5 transition-[border-color,box-shadow] duration-300 focus-within:border-orange-500/45 focus-within:shadow-[0_0_28px_-10px_rgba(249,115,22,0.6)] sm:gap-3.5 sm:px-4 sm:py-4">
                    <Link2
                      className="size-[1.125rem] shrink-0 text-orange-400/90 sm:size-5"
                      aria-hidden
                    />
                    <input
                      type="url"
                      value={slideshareUrl}
                      onChange={(event) => setSlideshareUrl(event.target.value)}
                      placeholder={content.urlPlaceholder}
                      className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-white/35 sm:text-base"
                      aria-label="SlideShare URL"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button
                      size="lg"
                      className="pulse-glow w-full"
                      onClick={handleDownload}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="size-5 animate-spin" />
                      ) : (
                        <Download className="size-5" />
                      )}
                      {content.downloadLabel}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full bg-black/20"
                      onClick={handlePreview}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="size-5 animate-spin" />
                      ) : (
                        <Eye className="size-5" />
                      )}
                      {content.previewLabel}
                    </Button>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {isLoading && !showPreview && (
                  <motion.div
                    initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="mb-4 flex items-center gap-3 text-sm text-orange-200">
                      <Loader2 className="size-4 animate-spin" />
                      Preparing slide preview...
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {Array.from({ length: 4 }).map((_, item) => (
                        <div
                          key={item}
                          className="skeleton-shimmer aspect-video rounded-xl bg-gradient-to-br from-white/10 via-white/5 to-orange-500/10"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-200 shadow-[0_0_40px_-20px_rgba(248,113,113,0.8)]"
                  >
                    <p className="font-semibold text-red-100">Preview failed</p>
                    <p className="mt-1 text-red-200/90">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {result && !error && (
                <motion.div
                  initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative mt-4 overflow-hidden rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-100"
                >
                  <AnimatePresence>
                    {showConfetti && !reducedMotion && (
                      <div
                        className="pointer-events-none absolute inset-0 overflow-hidden"
                        aria-hidden
                      >
                        {Array.from({ length: 6 }).map((_, item) => (
                          <motion.span
                            key={item}
                            initial={{ opacity: 1, x: "50%", y: "60%" }}
                            animate={{
                              opacity: 0,
                              x: `${24 + ((item * 19) % 52)}%`,
                              y: `${12 + ((item * 21) % 34)}%`,
                            }}
                            transition={{ duration: 0.75, ease: "easeOut" }}
                            className="absolute size-1.5 rounded-full bg-orange-300"
                          />
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                  {result.message}
                  {result.downloadUrl && (
                    <a
                      href={result.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-2 font-semibold text-orange-300 underline underline-offset-4"
                    >
                      Open download link
                    </a>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {showPreview && previewData && (
          <HeroPreviewWorkspace
            slideshareUrl={slideshareUrl}
            format={format}
            setFormat={setFormat}
            previewData={previewData}
            isLoading={isLoading}
            onDownload={handleDownload}
          />
        )}

        <div className="mx-auto mt-20 max-w-3xl content-auto">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {content.whatIsHeading}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {content.whatIs}
          </p>
        </div>
      </Container>
    </section>
  );
}
