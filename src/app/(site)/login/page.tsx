import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/data/settings";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { LoginForm } from "@/components/auth/login-form";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return buildPageMetadata({
    title: "Login",
    description:
      "Login to your SlideQuantum account to access download history, saved presentations, and dashboard tools.",
    siteUrl: settings.url,
    path: "/login",
    noIndex: true,
  });
}

export default function LoginPage() {
  return <LoginForm />;
}
