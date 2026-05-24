"use client";

import {
  BookOpen,
  Briefcase,
  GraduationCap,
  Microscope,
  type LucideIcon,
} from "lucide-react";
import type { HomepageContentData } from "@/types/content";
import { PremiumCard } from "@/components/ui/premium-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Container } from "@/components/ui/container";

const iconMap: Record<string, LucideIcon> = {
  GraduationCap,
  BookOpen,
  Briefcase,
  Microscope,
};

type TrustedUsersProps = {
  content: HomepageContentData["trustedUsersContent"];
};

export function TrustedUsers({ content }: TrustedUsersProps) {
  return (
    <section id="trusted-users" className="section-glow py-20 sm:py-28">
      <Container>
        <SectionHeading title={content.heading} as="h2" />

        <p className="mx-auto mt-6 max-w-3xl text-center text-base leading-relaxed text-muted-foreground sm:text-lg">
          {content.intro}
        </p>

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.items.map((user, index) => {
            const Icon = iconMap[user.icon];

            return (
              <PremiumCard key={user.title} delay={index * 0.08} as="li">
                <div className="mb-5 inline-flex rounded-xl border border-orange-500/20 bg-orange-500/10 p-3 text-orange-400 transition-all duration-300 group-hover:border-orange-500/40 group-hover:bg-orange-500/20 group-hover:shadow-[0_0_20px_-5px_rgba(249,115,22,0.5)]">
                  <Icon className="size-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {user.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {user.description}
                </p>
              </PremiumCard>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
