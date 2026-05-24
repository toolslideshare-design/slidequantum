import type { Metadata } from "next";
import { CursorGlow } from "@/components/effects/cursor-glow";

export const metadata: Metadata = {
  title: {
    default: "SlideQuantum Admin",
    template: "%s | SlideQuantum Admin",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="gradient-bg premium-ambient min-h-screen">
      <CursorGlow />
      {children}
    </div>
  );
}
