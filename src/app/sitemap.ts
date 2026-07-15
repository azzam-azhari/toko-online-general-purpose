import type { MetadataRoute } from "next";

import { serverEnv } from "@/configs/env/server";
import { getActiveProductSlugs } from "@/lib/repositories/storefront.repository";

const staticRoutes = ["", "/products", "/about", "/contact", "/faq", "/privacy", "/terms"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = serverEnv.appUrl;
  const now = new Date();
  const staticEntries = staticRoutes.map((route) => ({
    url: new URL(route || "/", baseUrl).toString(),
    lastModified: now,
    changeFrequency: route === "" ? ("daily" as const) : ("weekly" as const),
    priority: route === "" ? 1 : route === "/products" ? 0.9 : 0.6,
  }));

  try {
    const products = await getActiveProductSlugs();
    return [
      ...staticEntries,
      ...products.map((product) => ({
        url: new URL(`/products/${product.slug}`, baseUrl).toString(),
        lastModified: new Date(product.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    return staticEntries;
  }
}
