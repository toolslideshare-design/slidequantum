"use client";

import { motion } from "framer-motion";
import type { HomepageContentData } from "@/types/content";
import { Container } from "@/components/ui/container";

type CTAProps = {
  content: HomepageContentData["conclusionContent"];
};

export function CTA({ content }: CTAProps) {
  return (
    <section id="conclusion" className="py-20 sm:py-28">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/5 p-8 sm:p-16"
        >
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-orange-500/20 blur-[80px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-24 right-0 h-48 w-48 rounded-full bg-amber-500/15 blur-[60px]"
            aria-hidden
          />

          <div className="relative mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {content.heading}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {content.body}
            </p>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
