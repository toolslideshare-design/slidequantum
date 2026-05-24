export const STORAGE_KEYS = {
  headCode: "head-code",
  bodyCode: "body-code",
  aiSettings: "ai-settings",
  siteSettings: "site-settings",
  layoutSettings: "layout-settings",
  homepageContent: "homepage-content",
  favicon: "favicon",
  users: "users",
  downloadHistory: "download-history",
  savedPresentations: "saved-presentations",
  blogIndex: "blog:index",
  blogPost: (slug: string) => `blog:post:${slug}`,
} as const;
