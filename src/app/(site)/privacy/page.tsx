import type { Metadata } from "next";
import { LegalPageTemplate } from "@/components/seo/legal-page-template";
import { legalPages } from "@/lib/data/legal-content";
import { getSiteSettings } from "@/lib/data/settings";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const page = legalPages.privacy;

  return buildPageMetadata({
    title: page.title,
    description: page.description,
    siteUrl: settings.url,
    path: page.path,
  });
}

export default async function PrivacyPage() {
  const settings = await getSiteSettings();

  return (
    <LegalPageTemplate page={legalPages.privacy} siteUrl={settings.url} />
  );
}
