import "server-only";

import type { LayoutSettings } from "@/types/content";
import { LAYOUT_SETTINGS_FILE } from "./paths";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { readJson, writeJson } from "@/lib/storage/json-store";

const defaultLayoutSettings: LayoutSettings = {
  header: {
    logoText: "SlideQuantum",
    navigationLinks: [
      { label: "Home", href: "/" },
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "FAQ", href: "#faq" },
      { label: "Blog", href: "/blog" },
    ],
    loginButtonText: "Login",
    ctaButtonText: "Download Free",
  },
  footer: {
    description:
      "SlideQuantum is a free SlideShare downloader that helps you save presentations as high-quality PPT and PDF files on any device.",
    linkGroups: [
      {
        title: "Navigation",
        links: [
          { label: "Download", href: "/" },
          { label: "Features", href: "#features" },
          { label: "How it works", href: "#how-it-works" },
          { label: "Formats", href: "#formats" },
        ],
      },
      {
        title: "Resources",
        links: [
          { label: "Blog", href: "/blog" },
          { label: "FAQ", href: "#faq" },
          { label: "Comparison", href: "#comparison" },
        ],
      },
      {
        title: "Legal",
        links: [
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Terms", href: "/terms" },
          { label: "Contact", href: "/contact" },
        ],
      },
    ],
    copyrightText: "© {year} SlideQuantum. All rights reserved.",
    privacyPolicyLink: { label: "Privacy Policy", href: "/privacy" },
    contactLink: { label: "Contact", href: "/contact" },
    socialLinks: [
      { label: "Twitter", href: "https://twitter.com" },
      { label: "GitHub", href: "https://github.com" },
    ],
  },
};

export async function getLayoutSettings(): Promise<LayoutSettings> {
  return readJson(STORAGE_KEYS.layoutSettings, {
    filePath: LAYOUT_SETTINGS_FILE,
    fallback: defaultLayoutSettings,
  });
}

export async function saveLayoutSettings(settings: LayoutSettings): Promise<void> {
  await writeJson(STORAGE_KEYS.layoutSettings, settings, {
    filePath: LAYOUT_SETTINGS_FILE,
  });
}

export { defaultLayoutSettings };
