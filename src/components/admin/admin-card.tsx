"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type AdminCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function AdminCard({
  title,
  description,
  children,
  className,
}: AdminCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.005 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "glass-card glow-border rounded-2xl p-6 sm:p-8",
        className
      )}
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold">{title}</h2>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </motion.section>
  );
}
