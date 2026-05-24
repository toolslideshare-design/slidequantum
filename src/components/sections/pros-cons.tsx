"use client";

import type { HomepageContentData } from "@/types/content";
import { SectionHeading } from "@/components/ui/section-heading";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

type ProsConsProps = {
  content: HomepageContentData["comparisonContent"];
};

export function ProsCons({ content }: ProsConsProps) {
  return (
    <section id="comparison" className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          title={content.heading}
          description={content.subheading}
          as="h2"
        />

        <div className="mt-14 hidden overflow-hidden rounded-2xl border border-white/10 md:block">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                <th
                  scope="col"
                  className="px-6 py-5 text-sm font-semibold text-orange-400"
                >
                  {content.prosColumnLabel}
                </th>
                <th
                  scope="col"
                  className="px-6 py-5 text-sm font-semibold text-muted-foreground"
                >
                  {content.consColumnLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              {content.rows.map((row, index) => (
                <tr
                  key={`${row.pro}-${index}`}
                  className={cn(
                    "border-b border-white/5 transition-colors hover:bg-orange-500/[0.03]",
                    index === content.rows.length - 1 && "border-b-0"
                  )}
                >
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {row.pro}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {row.con}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-14 space-y-4 md:hidden">
          {content.rows.map((row, index) => (
            <div
              key={`${row.pro}-${index}`}
              className="premium-card glow-border rounded-2xl p-5"
            >
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">
                    {content.prosColumnLabel}
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {row.pro}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {content.consColumnLabel}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{row.con}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
