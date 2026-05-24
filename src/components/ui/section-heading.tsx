"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeUp, staggerContainer } from "@/lib/motion";

type SectionHeadingProps = {
  badge?: string;
  title: string;
  description?: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
  align?: "left" | "center";
};

export function SectionHeading({
  badge,
  title,
  description,
  className,
  as: Tag = "h2",
  align = "center",
}: SectionHeadingProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className={cn(
        "mx-auto max-w-3xl",
        align === "center" && "text-center",
        className
      )}
    >
      {badge && (
        <motion.span
          variants={fadeUp}
          className="mb-4 inline-flex rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-orange-400"
        >
          {badge}
        </motion.span>
      )}
      <motion.div variants={fadeUp}>
        <Tag className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        {title}
        </Tag>
      </motion.div>
      {description && (
        <motion.p
          variants={fadeUp}
          className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}
