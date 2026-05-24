/**
 * Shared TypeScript types for the app.
 * Add API response types here when you connect a backend.
 */

export type NavItem = {
  label: string;
  href: string;
};

export type Feature = {
  icon: string;
  title: string;
  description: string;
};

export type BlogPostPreview = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
};
