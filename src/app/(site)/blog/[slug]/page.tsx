import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllBlogPosts, getBlogPost } from "@/lib/data/blog";
import { getSiteSettings } from "@/lib/data/settings";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  createArticleSchema,
  createBreadcrumbSchema,
} from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/seo/json-ld";
import { Container } from "@/components/ui/container";
import { notFound } from "next/navigation";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [post, settings] = await Promise.all([
    getBlogPost(slug),
    getSiteSettings(),
  ]);

  if (!post) {
    return { title: "Post not found" };
  }

  return buildPageMetadata({
    title: post.title,
    description: post.seoDescription,
    siteUrl: settings.url,
    path: `/blog/${post.slug}`,
    openGraphType: "article",
    publishedTime: post.date,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([
    getBlogPost(slug),
    getSiteSettings(),
  ]);

  if (!post) {
    notFound();
  }

  const articleSchema = createArticleSchema(post, settings);
  const breadcrumbSchema = createBreadcrumbSchema(
    [
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` },
    ],
    settings.url
  );

  return (
    <article className="pt-28 pb-16 sm:pt-36 sm:pb-24">
      <JsonLd data={[articleSchema, breadcrumbSchema]} />
      <Container className="max-w-3xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-orange-400"
        >
          <ArrowLeft className="size-4" />
          Back to blog
        </Link>

        <time
          dateTime={post.date}
          className="mt-8 block text-sm text-muted-foreground"
        >
          {new Date(post.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>

        <h1 className="mt-2 text-4xl font-bold tracking-tight">{post.title}</h1>

        <div className="prose prose-invert mt-8 max-w-none">
          {post.content.split("\n\n").map((paragraph, index) => (
            <p
              key={index}
              className="mb-4 text-base leading-relaxed text-muted-foreground"
            >
              {paragraph.replace(/^#+\s*/, "")}
            </p>
          ))}
        </div>
      </Container>
    </article>
  );
}
