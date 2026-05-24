"use client";

import { useEffect, useRef } from "react";

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px) and (pointer: fine)");
    if (!media.matches) {
      return;
    }

    const glow = glowRef.current;
    if (!glow) {
      return;
    }

    let frame = 0;
    let visible = false;

    function handleMove(event: MouseEvent) {
      if (frame || !glow) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        if (!glow) {
          frame = 0;
          return;
        }
        document.documentElement.style.setProperty(
          "--cursor-x",
          `${event.clientX}px`
        );
        document.documentElement.style.setProperty(
          "--cursor-y",
          `${event.clientY}px`
        );

        if (!visible) {
          glow.style.opacity = "1";
          visible = true;
        }

        frame = 0;
      });
    }

    function handleLeave() {
      if (glow) {
        glow.style.opacity = "0";
      }
      visible = false;
    }

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="cursor-glow opacity-0"
      aria-hidden
    />
  );
}
