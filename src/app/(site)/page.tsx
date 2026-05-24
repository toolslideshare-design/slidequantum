import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getHomepageContent } from "@/lib/data/homepage";
import { getSiteSettings } from "@/lib/data/settings";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { createHomepageSchemaGraph } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/seo/json-ld";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Differentiators } from "@/components/sections/differentiators";
import { FormatInfo } from "@/components/sections/format-info";
import { Features } from "@/components/sections/features";
import { TrustedUsers } from "@/components/sections/trusted-users";
import { ProsCons } from "@/components/sections/pros-cons";
import { FAQ } from "@/components/sections/faq";
import { CTA } from "@/components/sections/cta";

const Hero = dynamic(
  () => import("@/components/sections/hero").then((module) => module.Hero),
  {
    loading: () => (
      <section className="hero-section relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div className="mx-auto max-w-4xl animate-pulse px-4 text-center">
          <div className="mx-auto mb-8 h-10 w-56 rounded-full bg-white/10" />
          <div className="mx-auto h-14 w-full max-w-3xl rounded-2xl bg-white/10" />
          <div className="mx-auto mt-6 h-24 w-full max-w-2xl rounded-2xl bg-white/10" />
        </div>
      </section>
    ),
  }
);

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return buildPageMetadata({
    title: settings.metaTitle,
    description: settings.metaDescription,
    siteUrl: settings.url,
    path: "/",
    keywords: settings.keywords,
    absoluteTitle: true,
  });
}

export default async function HomePage() {
  const [content, settings] = await Promise.all([
    getHomepageContent(),
    getSiteSettings(),
  ]);

  const structuredData = createHomepageSchemaGraph(
    settings,
    content.faqContent
  );

  return (
    <>
      <JsonLd data={structuredData} />
      <Hero content={content.heroContent} />
      <HowItWorks content={content.howItWorksContent} />
      <Differentiators content={content.differentiatorsContent} />
      <FormatInfo content={content.formatsContent} />
      <Features content={content.featuresContent} />
      <TrustedUsers content={content.trustedUsersContent} />
      <ProsCons content={content.comparisonContent} />
      <FAQ content={content.faqContent} />
      <CTA content={content.conclusionContent} />
    </>
  );
}
