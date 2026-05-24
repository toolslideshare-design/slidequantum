import { notFound } from "next/navigation";
import { getBlogPost } from "@/lib/data/blog";
import { BlogForm } from "@/components/admin/blog-form";

type EditBlogPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function AdminEditBlogPage({ params }: EditBlogPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return <BlogForm mode="edit" initialPost={post} />;
}
