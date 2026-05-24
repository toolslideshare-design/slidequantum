import type { BlogPost, HomepageContentData, SiteSettings } from "@/types/content";

type JsonLd = Record<string, unknown>;

export function createWebsiteSchema(settings: SiteSettings): JsonLd {
  return {
    "@type": "WebSite",
    "@id": `${settings.url}/#website`,
    name: settings.name,
    url: settings.url,
    description: settings.metaDescription,
    inLanguage: "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${settings.url}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function createOrganizationSchema(settings: SiteSettings): JsonLd {
  return {
    "@type": "Organization",
    "@id": `${settings.url}/#organization`,
    name: settings.name,
    url: settings.url,
    logo: {
      "@type": "ImageObject",
      url: `${settings.url}/favicon.svg`,
    },
    description: settings.metaDescription,
  };
}

export function createSoftwareApplicationSchema(
  settings: SiteSettings
): JsonLd {
  return {
    "@type": "SoftwareApplication",
    "@id": `${settings.url}/#software`,
    name: settings.name,
    url: settings.url,
    description: settings.metaDescription,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "SlideShare downloader",
      "SlideShare to PDF download",
      "SlideShare to PPT download",
      "PPT downloader",
      "PDF downloader",
      "Live slide preview",
      "AI presentation summary",
      "AI study notes",
      "AI quiz generator",
      "AI presentation explainer",
    ],
    publisher: {
      "@id": `${settings.url}/#organization`,
    },
  };
}

export function createFaqSchema(
  faqContent: HomepageContentData["faqContent"],
  siteUrl: string
): JsonLd {
  return {
    "@type": "FAQPage",
    "@id": `${siteUrl}/#faq`,
    mainEntity: faqContent.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function createHomepageSchemaGraph(
  settings: SiteSettings,
  faqContent: HomepageContentData["faqContent"]
) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      createWebsiteSchema(settings),
      createOrganizationSchema(settings),
      createSoftwareApplicationSchema(settings),
      createFaqSchema(faqContent, settings.url),
    ],
  };
}

export function createArticleSchema(
  post: BlogPost,
  settings: SiteSettings
): JsonLd {
  const canonical = `${settings.url}/blog/${post.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDescription,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: settings.name,
      url: settings.url,
    },
    publisher: {
      "@type": "Organization",
      name: settings.name,
      url: settings.url,
      logo: {
        "@type": "ImageObject",
        url: `${settings.url}/favicon.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
    url: canonical,
    inLanguage: "en-US",
  };
}

export function createBreadcrumbSchema(
  items: { name: string; path: string }[],
  siteUrl: string
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path === "/" ? siteUrl : `${siteUrl}${item.path}`,
    })),
  };
}

export function createWebPageSchema({
  title,
  description,
  path,
  siteUrl,
}: {
  title: string;
  description: string;
  path: string;
  siteUrl: string;
}): JsonLd {
  const url = path === "/" ? siteUrl : `${siteUrl}${path}`;

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url,
    inLanguage: "en-US",
    isPartOf: {
      "@type": "WebSite",
      url: siteUrl,
    },
  };
}
