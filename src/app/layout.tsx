import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getSiteSettings } from "@/lib/data/settings";
import { getHeadCode } from "@/lib/data/head-code";
import { getBodyCode } from "@/lib/data/body-code";
import { getFaviconSettings } from "@/lib/data/favicon";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const [settings, favicon] = await Promise.all([
    getSiteSettings(),
    getFaviconSettings(),
  ]);
  const faviconUrl = favicon.updatedAt
    ? `${favicon.href}?v=${encodeURIComponent(favicon.updatedAt)}`
    : favicon.href;

  return {
    metadataBase: new URL(settings.url),
    title: {
      default: settings.metaTitle,
      template: `%s | ${settings.name}`,
    },
    description: settings.metaDescription,
    keywords: settings.keywords,
    authors: [{ name: settings.name }],
    openGraph: {
      type: "website",
      locale: "en_US",
      url: settings.url,
      title: settings.metaTitle,
      description: settings.metaDescription,
      siteName: settings.name,
    },
    twitter: {
      card: "summary_large_image",
      title: settings.metaTitle,
      description: settings.metaDescription,
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: [{ url: faviconUrl, type: favicon.contentType }],
      shortcut: [{ url: faviconUrl, type: favicon.contentType }],
      apple: [
        {
          url: faviconUrl,
          type: favicon.contentType,
          sizes: "180x180",
        },
      ],
    },
    manifest: "/manifest.webmanifest",
    category: "technology",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [headCode, bodyCode] = await Promise.all([
    getHeadCode(),
    getBodyCode(),
  ]);

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      {headCode.code.trim() && (
        <head dangerouslySetInnerHTML={{ __html: headCode.code }} />
      )}
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        {children}
        {bodyCode.code.trim() && (
          <div dangerouslySetInnerHTML={{ __html: bodyCode.code }} />
        )}
      </body>
    </html>
  );
}
