import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/data/settings";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/dashboard",
          "/login",
          "/signup",
        ],
      },
    ],
    sitemap: `${settings.url}/sitemap.xml`,
    host: settings.url,
  };
}
