import type { Metadata } from "next";

type PageMetadataOptions = {
  title: string;
  description: string;
  siteUrl: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
  openGraphType?: "website" | "article";
  publishedTime?: string;
  absoluteTitle?: boolean;
};

export function buildPageMetadata({
  title,
  description,
  siteUrl,
  path = "",
  keywords,
  noIndex = false,
  openGraphType = "website",
  publishedTime,
  absoluteTitle = false,
}: PageMetadataOptions): Metadata {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const canonical =
    normalizedPath === "/" ? siteUrl : `${siteUrl}${normalizedPath}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      type: openGraphType,
      locale: "en_US",
      url: canonical,
      title,
      description,
      ...(openGraphType === "article" && publishedTime
        ? { publishedTime }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : { index: true, follow: true },
  };
}

export const NOINDEX_METADATA: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};
