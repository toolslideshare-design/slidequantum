"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { adminInputClassName } from "@/components/admin/admin-field";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    setLoading(false);

    if (!response.ok) {
      setError("Invalid username or password");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <Container className="max-w-md">
        <div className="glass-card glow-border rounded-3xl p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">
            Private Admin Access
          </p>
          <h1 className="mt-2 text-3xl font-bold">Admin Login</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to manage homepage content, blog posts, and SEO settings.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-medium">Username</span>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`${adminInputClassName()} pl-10`}
                  autoComplete="username"
                  required
                />
              </div>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Password</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${adminInputClassName()} pl-10`}
                  autoComplete="current-password"
                  required
                />
              </div>
            </label>

            {error && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>
        </div>
      </Container>
    </div>
  );
}
