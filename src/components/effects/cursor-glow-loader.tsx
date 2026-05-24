"use client";

import dynamic from "next/dynamic";

export const CursorGlow = dynamic(
  () => import("./cursor-glow").then((module) => module.CursorGlow),
  { ssr: false }
);
