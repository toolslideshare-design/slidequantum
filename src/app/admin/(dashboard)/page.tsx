import Link from "next/link";
import { ArrowRight, BrainCircuit, Code2, FileText, Home, LayoutTemplate, Settings } from "lucide-react";
import { getAllBlogPosts } from "@/lib/data/blog";

export default async function AdminDashboardPage() {
  const posts = await getAllBlogPosts();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your SlideQuantum website content from one place.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <Link
          href="/admin/homepage"
          className="premium-card glow-border group rounded-2xl p-6 transition-all"
        >
          <Home className="size-8 text-orange-400" />
          <h2 className="mt-4 text-lg font-semibold">Homepage Editor</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Edit hero, features, FAQ, and all homepage sections.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm text-orange-400">
            Open editor
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        <Link
          href="/admin/blog"
          className="premium-card glow-border group rounded-2xl p-6 transition-all"
        >
          <FileText className="size-8 text-orange-400" />
          <h2 className="mt-4 text-lg font-semibold">Blog Manager</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {posts.length} blog post{posts.length === 1 ? "" : "s"} published.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm text-orange-400">
            Manage posts
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        <Link
          href="/admin/layout"
          className="premium-card glow-border group rounded-2xl p-6 transition-all"
        >
          <LayoutTemplate className="size-8 text-orange-400" />
          <h2 className="mt-4 text-lg font-semibold">Layout Settings</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Edit header, footer, links, CTA, and social links.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm text-orange-400">
            Edit layout
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        <Link
          href="/admin/settings"
          className="premium-card glow-border group rounded-2xl p-6 transition-all"
        >
          <Settings className="size-8 text-orange-400" />
          <h2 className="mt-4 text-lg font-semibold">Site Settings</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Update site name, meta title, description, and keywords.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm text-orange-400">
            Open settings
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        <Link
          href="/admin/head-code"
          className="premium-card glow-border group rounded-2xl p-6 transition-all"
        >
          <Code2 className="size-8 text-orange-400" />
          <h2 className="mt-4 text-lg font-semibold">Head Code</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Add analytics, verification tags, pixels, and custom head scripts.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm text-orange-400">
            Edit code
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        <Link
          href="/admin/body-code"
          className="premium-card glow-border group rounded-2xl p-6 transition-all"
        >
          <Code2 className="size-8 text-orange-400" />
          <h2 className="mt-4 text-lg font-semibold">Body Code</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Add chat widgets, tracking scripts, popups, and marketing tools.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm text-orange-400">
            Edit code
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        <Link
          href="/admin/ai-settings"
          className="premium-card glow-border group rounded-2xl p-6 transition-all"
        >
          <BrainCircuit className="size-8 text-orange-400" />
          <h2 className="mt-4 text-lg font-semibold">AI Settings</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage Gemini API access for AI Summary, Notes, and future tools.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm text-orange-400">
            Configure AI
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

      </div>
    </div>
  );
}
