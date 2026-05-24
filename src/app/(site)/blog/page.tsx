import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { getAllBlogPosts } from "@/lib/data/blog";
import { getSiteSettings } from "@/lib/data/settings";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  createBreadcrumbSchema,
  createWebPageSchema,
} from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/seo/json-ld";
import { Container } from "@/components/ui/container";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return buildPageMetadata({
    title: "SlideShare Downloader Blog – Guides & Tips",
    description:
      "Read guides about downloading SlideShare presentations as PPT and PDF, format tips, and how to use AI study tools with presentations.",
    siteUrl: settings.url,
    path: "/blog",
    keywords: [
      "slideshare blog",
      "download slideshare guide",
      "slideshare to pdf tips",
      "presentation download help",
    ],
  });
}

export default async function BlogPage() {
  const [posts, settings] = await Promise.all([
    getAllBlogPosts(),
    getSiteSettings(),
  ]);

  const breadcrumbSchema = createBreadcrumbSchema(
    [
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
    ],
    settings.url
  );

  const webPageSchema = createWebPageSchema({
    title: "SlideShare Downloader Blog",
    description:
      "Guides and tips about SlideShare downloads, PPT and PDF conversion, and presentation study workflows.",
    path: "/blog",
    siteUrl: settings.url,
  });

  return (
    <section className="pt-28 pb-16 sm:pt-36 sm:pb-24">
      <JsonLd data={[breadcrumbSchema, webPageSchema]} />
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Blog</h1>
          <p className="mt-4 text-muted-foreground">
            Guides and tips about SlideShare downloads, PPT and PDF conversion,
            and AI-powered study tools.
          </p>
        </div>

        <ul className="mx-auto mt-12 grid max-w-3xl gap-6">
          {posts.map((post) => (
            <li key={post.slug}>
              <article className="glass-card group p-6 transition-transform hover:-translate-y-0.5">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-orange-500/10 p-3 text-orange-400">
                    <FileText className="size-5" />
                  </div>
                  <div className="flex-1">
                    <time
                      dateTime={post.date}
                      className="text-xs text-muted-foreground"
                    >
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    <h2 className="mt-1 text-xl font-semibold">{post.title}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {post.seoDescription}
                    </p>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-orange-400 transition-colors hover:text-orange-300"
                    >
                      Read more
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
