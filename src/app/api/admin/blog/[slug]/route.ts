import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/admin-api";
import { deleteBlogPost, getBlogPost, saveBlogPost } from "@/lib/data/blog";
import type { BlogPost } from "@/types/content";

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const authError = await requireAdminApi();
  if (authError) return authError;

  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const authError = await requireAdminApi();
  if (authError) return authError;

  const { slug: oldSlug } = await params;

  try {
    const body = (await request.json()) as BlogPost;
    const existing = await getBlogPost(oldSlug);

    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const newSlug = body.slug?.trim() || oldSlug;

    if (newSlug !== oldSlug) {
      await deleteBlogPost(oldSlug);
    }

    const post: BlogPost = {
      title: body.title.trim(),
      slug: newSlug,
      content: body.content ?? "",
      seoDescription: body.seoDescription ?? "",
      date: body.date || existing.date,
    };

    await saveBlogPost(post);
    revalidatePath("/blog");
    revalidatePath(`/blog/${oldSlug}`);
    revalidatePath(`/blog/${newSlug}`);

    return NextResponse.json(post);
  } catch {
    return NextResponse.json({ error: "Failed to update blog post" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const authError = await requireAdminApi();
  if (authError) return authError;

  const { slug } = await params;
  const deleted = await deleteBlogPost(slug);

  if (!deleted) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);

  return NextResponse.json({ success: true });
}
