import { siteSettings } from "@/config/site-settings";

export const siteConfig = {
  name: siteSettings.name,
  description: siteSettings.metaDescription,
  metaTitle: siteSettings.metaTitle,
  keywords: siteSettings.keywords,
  url: siteSettings.url,
  ogImage: "/og-image.png",
  links: {
    github: "https://github.com",
    twitter: "https://twitter.com",
  },
} as const;
