import "server-only";

import { readFile, readdir } from "fs/promises";
import path from "path";
import type { BlogPost } from "@/types/content";
import { BLOG_DIR } from "./paths";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import {
  deleteJson,
  isKvStorageEnabled,
  readJson,
  writeJson,
} from "@/lib/storage/json-store";

function blogFilePath(slug: string): string {
  return path.join(BLOG_DIR, `${slug}.json`);
}

async function readBlogPostsFromFilesystem(): Promise<BlogPost[]> {
  let files: string[] = [];

  try {
    files = await readdir(BLOG_DIR);
  } catch {
    return [];
  }

  const posts = await Promise.all(
    files
      .filter((file) => file.endsWith(".json"))
      .map(async (file) => {
        const raw = await readFile(path.join(BLOG_DIR, file), "utf8");
        return JSON.parse(raw) as BlogPost;
      })
  );

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

async function getBlogIndex(): Promise<string[]> {
  return readJson<string[]>(STORAGE_KEYS.blogIndex, { fallback: [] });
}

async function setBlogIndex(slugs: string[]): Promise<void> {
  await writeJson(STORAGE_KEYS.blogIndex, slugs);
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const fsPosts = await readBlogPostsFromFilesystem();
  const indexedSlugs = isKvStorageEnabled() ? await getBlogIndex() : [];
  const allSlugs = [
    ...new Set([...indexedSlugs, ...fsPosts.map((post) => post.slug)]),
  ];

  if (allSlugs.length === 0) {
    return [];
  }

  const posts = await Promise.all(allSlugs.map((slug) => getBlogPost(slug)));

  return posts
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const post = await readJson<BlogPost | null>(STORAGE_KEYS.blogPost(slug), {
    filePath: blogFilePath(slug),
    fallback: null,
  });

  return post;
}

export async function saveBlogPost(post: BlogPost): Promise<void> {
  await writeJson(STORAGE_KEYS.blogPost(post.slug), post, {
    filePath: blogFilePath(post.slug),
  });

  if (isKvStorageEnabled()) {
    const slugs = await getBlogIndex();
    if (!slugs.includes(post.slug)) {
      await setBlogIndex([post.slug, ...slugs]);
    }
  }
}

export async function deleteBlogPost(slug: string): Promise<boolean> {
  try {
    if (isKvStorageEnabled()) {
      await deleteJson(STORAGE_KEYS.blogPost(slug));
      const slugs = await getBlogIndex();
      await setBlogIndex(slugs.filter((entry) => entry !== slug));
    }

    const { unlink } = await import("fs/promises");
    await unlink(blogFilePath(slug));
    return true;
  } catch {
    return isKvStorageEnabled();
  }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
