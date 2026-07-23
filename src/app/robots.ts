import type { MetadataRoute } from "next";
import { getRequestSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await getRequestSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/izbor-firme", "/login", "/registracija"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
