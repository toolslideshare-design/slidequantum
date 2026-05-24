"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import type { BlogPost } from "@/types/content";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminField, adminInputClassName } from "@/components/admin/admin-field";
import { Button } from "@/components/ui/button";

type BlogFormProps = {
  initialPost?: BlogPost;
  mode: "create" | "edit";
};

export function BlogForm({ initialPost, mode }: BlogFormProps) {
  const router = useRouter();
  const [post, setPost] = useState<BlogPost>(
    initialPost ?? {
      title: "",
      slug: "",
      content: "",
      seoDescription: "",
      date: new Date().toISOString().slice(0, 10),
    }
  );
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const input = adminInputClassName();
  const textarea = `${input} min-h-40 resize-y`;

  async function handleSave() {
    setSaving(true);
    setMessage("");

    const url =
      mode === "create"
        ? "/api/admin/blog"
        : `/api/admin/blog/${initialPost?.slug}`;

    const method = mode === "create" ? "POST" : "PUT";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(post),
    });

    setSaving(false);

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setMessage(data.error ?? "Failed to save blog post.");
      return;
    }

    setMessage("Blog post saved successfully.");
    router.push("/admin/blog");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {mode === "create" ? "New Blog Post" : "Edit Blog Post"}
          </h1>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="size-4" />
          {saving ? "Saving..." : "Save Post"}
        </Button>
      </div>

      {message && (
        <p className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm text-orange-200">
          {message}
        </p>
      )}

      <AdminCard title="Post Details">
        <div className="grid gap-4">
          <AdminField label="Title">
            <input
              className={input}
              value={post.title}
              onChange={(e) => setPost({ ...post, title: e.target.value })}
            />
          </AdminField>
          <AdminField label="Slug">
            <input
              className={input}
              value={post.slug}
              onChange={(e) => setPost({ ...post, slug: e.target.value })}
              placeholder="my-blog-post"
            />
          </AdminField>
          <AdminField label="Date">
            <input
              type="date"
              className={input}
              value={post.date}
              onChange={(e) => setPost({ ...post, date: e.target.value })}
            />
          </AdminField>
          <AdminField label="SEO Description">
            <textarea
              className={textarea}
              value={post.seoDescription}
              onChange={(e) => setPost({ ...post, seoDescription: e.target.value })}
            />
          </AdminField>
          <AdminField label="Content (Markdown supported as plain text paragraphs)">
            <textarea
              className={`${textarea} min-h-64`}
              value={post.content}
              onChange={(e) => setPost({ ...post, content: e.target.value })}
            />
          </AdminField>
        </div>
      </AdminCard>
    </div>
  );
}
