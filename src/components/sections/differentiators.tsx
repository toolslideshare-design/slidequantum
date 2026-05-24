"use client";

import { motion } from "framer-motion";
import type { HomepageContentData } from "@/types/content";
import { Container } from "@/components/ui/container";

type DifferentiatorsProps = {
  content: HomepageContentData["differentiatorsContent"];
};

export function Differentiators({ content }: DifferentiatorsProps) {
  return (
    <section id="differentiators" className="py-20 sm:py-28">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="premium-card glow-border mx-auto max-w-4xl p-8 sm:p-12"
        >
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            {content.heading}
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {content.body}
          </p>
        </motion.div>
      </Container>
    </section>
  );
}
