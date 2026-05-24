"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = HTMLMotionProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: "btn-glow",
  secondary:
    "glass-card border-white/10 text-foreground hover:border-orange-500/30 hover:shadow-[0_0_30px_-10px_rgba(249,115,22,0.4)] hover:scale-[1.02]",
  ghost:
    "text-muted-foreground hover:bg-white/5 hover:text-orange-400 hover:scale-[1.02]",
  outline:
    "border border-white/15 bg-transparent text-foreground hover:border-orange-500/50 hover:text-orange-400 hover:shadow-[0_0_30px_-10px_rgba(249,115,22,0.3)] hover:scale-[1.02]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.015 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      data-hover-sound="ready"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
