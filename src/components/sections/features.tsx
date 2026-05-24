"use client";

import {
  Download,
  Eye,
  FileStack,
  Gauge,
  Lock,
  Shield,
  Smile,
  Sparkles,
  UserX,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { HomepageContentData } from "@/types/content";
import { PremiumCard } from "@/components/ui/premium-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Container } from "@/components/ui/container";

const iconMap: Record<string, LucideIcon> = {
  Download,
  FileStack,
  UserX,
  Sparkles,
  Eye,
  Zap,
  Shield,
  Lock,
  Gauge,
  Smile,
};

type FeaturesProps = {
  content: HomepageContentData["featuresContent"];
};

export function Features({ content }: FeaturesProps) {
  return (
    <section id="features" className="py-20 sm:py-28">
      <Container>
        <SectionHeading title={content.heading} as="h2" />

        <p className="mx-auto mt-6 max-w-3xl text-center text-base leading-relaxed text-muted-foreground sm:text-lg">
          {content.intro}
        </p>

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {content.items.map((feature, index) => {
            const Icon = iconMap[feature.icon] ?? Download;

            return (
              <PremiumCard key={feature.title} delay={index * 0.05} as="li">
                <div className="mb-4 inline-flex rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/10 p-2.5 text-orange-400 transition-all duration-300 group-hover:shadow-[0_0_20px_-5px_rgba(249,115,22,0.5)]">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-base font-semibold leading-snug text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </PremiumCard>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
