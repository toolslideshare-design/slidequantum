"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Edit, Plus, Trash2 } from "lucide-react";
import type { BlogPost } from "@/types/content";
import { Button } from "@/components/ui/button";

export function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPosts() {
    const response = await fetch("/api/admin/blog");
    const data = (await response.json()) as BlogPost[];
    setPosts(data);
    setLoading(false);
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function handleDelete(slug: string) {
    if (!confirm("Delete this blog post?")) return;

    await fetch(`/api/admin/blog?slug=${encodeURIComponent(slug)}`, {
      method: "DELETE",
    });

    loadPosts();
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading blog posts...</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Manager</h1>
          <p className="mt-2 text-muted-foreground">
            Add, edit, or delete blog posts stored in src/content/blog/.
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="btn-glow inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-base font-semibold"
        >
          <Plus className="size-4" />
          New Post
        </Link>
      </div>

      <div className="space-y-4">
        {posts.length === 0 && (
          <p className="rounded-xl border border-white/10 bg-black/20 px-4 py-6 text-sm text-muted-foreground">
            No blog posts yet. Create your first post.
          </p>
        )}

        {posts.map((post, index) => (
          <motion.article
            key={post.slug}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, scale: 1.006 }}
            transition={{ delay: index * 0.045, duration: 0.32 }}
            className="premium-card glow-border flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 className="text-lg font-semibold">{post.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">/{post.slug}</p>
              <p className="mt-2 text-sm text-muted-foreground">{post.seoDescription}</p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/blog/${post.slug}/edit`}
                className="glass-card inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:scale-[1.02]"
              >
                <Edit className="size-4" />
                Edit
              </Link>
              <Button variant="ghost" onClick={() => handleDelete(post.slug)}>
                <Trash2 className="size-4" />
                Delete
              </Button>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
