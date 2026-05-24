"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ElementType, ReactNode } from "react";

type PremiumCardProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  animate?: boolean;
  delay?: number;
};

export function PremiumCard({
  children,
  className,
  as: Component = "div",
  animate = true,
  delay = 0,
}: PremiumCardProps) {
  const cardClasses = cn(
    "premium-card glow-border group relative p-6 sm:p-8",
    className
  );

  const inner = (
    <>
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-orange-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      />
      <div className="relative">{children}</div>
    </>
  );

  if (!animate) {
    return <Component className={cardClasses}>{inner}</Component>;
  }

  const MotionComponent = motion.create(Component);

  return (
    <MotionComponent
      className={cardClasses}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={animate ? { y: -6, scale: 1.012 } : undefined}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {inner}
    </MotionComponent>
  );
}
