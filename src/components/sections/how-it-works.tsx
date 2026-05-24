"use client";

import { ClipboardPaste, Download, FileType } from "lucide-react";
import type { HomepageContentData } from "@/types/content";
import { PremiumCard } from "@/components/ui/premium-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Container } from "@/components/ui/container";

const stepIcons = [ClipboardPaste, FileType, Download];
const stepNumbers = ["01", "02", "03"];

type HowItWorksProps = {
  content: HomepageContentData["howItWorksContent"];
};

export function HowItWorks({ content }: HowItWorksProps) {
  return (
    <section id="how-it-works" className="section-glow py-20 sm:py-28">
      <Container>
        <SectionHeading title={content.heading} as="h2" />

        <p className="mx-auto mt-6 max-w-3xl text-center text-base leading-relaxed text-muted-foreground sm:text-lg">
          {content.intro}
        </p>

        <ol className="mt-14 grid gap-8 md:grid-cols-3">
          {content.steps.map((item, index) => {
            const Icon = stepIcons[index];

            return (
              <li key={item.title}>
                <PremiumCard delay={index * 0.1} as="article">
                  <div className="mb-6 flex items-center justify-between">
                    <span className="text-4xl font-bold text-gradient opacity-60">
                      {stepNumbers[index]}
                    </span>
                    <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-3 text-orange-400 transition-all duration-300 group-hover:border-orange-500/40 group-hover:shadow-[0_0_20px_-5px_rgba(249,115,22,0.5)]">
                      <Icon className="size-6" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {item.description}
                  </p>
                </PremiumCard>
              </li>
            );
          })}
        </ol>

        <p className="mx-auto mt-12 max-w-3xl text-center text-base leading-relaxed text-muted-foreground sm:text-lg">
          {content.closing}
        </p>
      </Container>
    </section>
  );
}
