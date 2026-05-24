import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/user-auth";
import {
  getUserDownloadHistory,
  getUserSavedPresentations,
} from "@/lib/data/user-dashboard";
import { getSiteSettings } from "@/lib/data/settings";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/container";

const UserDashboard = dynamic(
  () =>
    import("@/components/dashboard/user-dashboard").then(
      (module) => module.UserDashboard
    ),
  {
    loading: () => (
      <div className="mt-10 animate-pulse space-y-6">
        <div className="h-48 rounded-3xl bg-white/10" />
        <div className="h-64 rounded-3xl bg-white/10" />
      </div>
    ),
  }
);
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return buildPageMetadata({
    title: "Dashboard",
    description: "Your SlideQuantum dashboard.",
    siteUrl: settings.url,
    path: "/dashboard",
    noIndex: true,
  });
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [history, savedPresentations] = await Promise.all([
    getUserDownloadHistory(user.id),
    getUserSavedPresentations(user.id),
  ]);

  return (
    <section className="pt-28 pb-20 sm:pt-36">
      <Container>
        <div className="glass-card glow-border relative overflow-hidden rounded-3xl p-8 sm:p-10">
          <div
            className="pointer-events-none absolute right-0 top-0 h-60 w-60 rounded-full bg-orange-500/15 blur-3xl"
            aria-hidden
          />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm text-orange-300">
              <Sparkles className="size-4" />
              User Dashboard
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome, {user.name}
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Manage your downloads, saved presentations, and account settings from one place.
            </p>
          </div>
        </div>

        <UserDashboard
          user={user}
          initialHistory={history}
          initialSavedPresentations={savedPresentations}
        />
      </Container>
    </section>
  );
}
