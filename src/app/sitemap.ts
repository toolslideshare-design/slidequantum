import type { MetadataRoute } from "next";
import { getAllBlogPosts } from "@/lib/data/blog";
import { legalPages } from "@/lib/data/legal-content";
import { getSiteSettings } from "@/lib/data/settings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSiteSettings();
  const posts = await getAllBlogPosts();
  const baseUrl = settings.url;
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...Object.values(legalPages).map((page) => ({
      url: `${baseUrl}${page.path}`,
      lastModified: new Date(page.lastUpdated),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];

  const blogPages = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages];
}
