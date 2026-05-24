"use client";

import { FileImage, Presentation } from "lucide-react";
import type { HomepageContentData } from "@/types/content";
import { PremiumCard } from "@/components/ui/premium-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Container } from "@/components/ui/container";

const formatIcons = [Presentation, FileImage];

type FormatInfoProps = {
  content: HomepageContentData["formatsContent"];
};

export function FormatInfo({ content }: FormatInfoProps) {
  return (
    <section id="formats" className="section-glow py-20 sm:py-28">
      <Container>
        <SectionHeading title={content.heading} as="h2" />

        <p className="mx-auto mt-6 max-w-3xl text-center text-base leading-relaxed text-muted-foreground sm:text-lg">
          {content.intro}
        </p>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {content.items.map((format, index) => {
            const Icon = formatIcons[index];

            return (
              <PremiumCard key={format.title} delay={index * 0.1} as="article">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-3 text-orange-400 transition-all duration-300 group-hover:shadow-[0_0_20px_-5px_rgba(249,115,22,0.5)]">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground sm:text-2xl">
                    {format.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {format.description}
                </p>
              </PremiumCard>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
