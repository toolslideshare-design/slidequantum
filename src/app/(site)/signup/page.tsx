import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/data/settings";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SignupForm } from "@/components/auth/signup-form";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return buildPageMetadata({
    title: "Sign Up",
    description:
      "Create a free SlideQuantum account to save presentations, track downloads, and manage your dashboard.",
    siteUrl: settings.url,
    path: "/signup",
    noIndex: true,
  });
}

export default function SignupPage() {
  return <SignupForm />;
}
