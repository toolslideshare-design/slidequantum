import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi, adminSaveErrorResponse } from "@/lib/admin-api";
import {
  deleteBlogPost,
  getAllBlogPosts,
  getBlogPost,
  saveBlogPost,
  slugify,
} from "@/lib/data/blog";
import type { BlogPost } from "@/types/content";

export async function GET() {
  const authError = await requireAdminApi();
  if (authError) return authError;

  const posts = await getAllBlogPosts();
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const authError = await requireAdminApi();
  if (authError) return authError;

  try {
    const body = (await request.json()) as BlogPost;
    const slug = body.slug?.trim() || slugify(body.title);

    if (!slug || !body.title?.trim()) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
    }

    const existing = await getBlogPost(slug);
    if (existing) {
      return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });
    }

    const post: BlogPost = {
      title: body.title.trim(),
      slug,
      content: body.content ?? "",
      seoDescription: body.seoDescription ?? "",
      date: body.date || new Date().toISOString().slice(0, 10),
    };

    await saveBlogPost(post);
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return adminSaveErrorResponse(error, "Failed to create blog post");
  }
}

export async function DELETE(request: Request) {
  const authError = await requireAdminApi();
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  const deleted = await deleteBlogPost(slug);
  if (!deleted) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);

  return NextResponse.json({ success: true });
}
