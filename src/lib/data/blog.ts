import "server-only";

import { readFile, writeFile, readdir, unlink, mkdir } from "fs/promises";
import path from "path";
import type { BlogPost } from "@/types/content";
import { BLOG_DIR } from "./paths";

function blogFilePath(slug: string): string {
  return path.join(BLOG_DIR, `${slug}.json`);
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  await mkdir(BLOG_DIR, { recursive: true });

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

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const raw = await readFile(blogFilePath(slug), "utf8");
    return JSON.parse(raw) as BlogPost;
  } catch {
    return null;
  }
}

export async function saveBlogPost(post: BlogPost): Promise<void> {
  await mkdir(BLOG_DIR, { recursive: true });
  await writeFile(blogFilePath(post.slug), JSON.stringify(post, null, 2), "utf8");
}

export async function deleteBlogPost(slug: string): Promise<boolean> {
  try {
    await unlink(blogFilePath(slug));
    return true;
  } catch {
    return false;
  }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
