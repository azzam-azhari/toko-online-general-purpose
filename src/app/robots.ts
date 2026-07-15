import type { MetadataRoute } from "next";

import { serverEnv } from "@/configs/env/server";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/api/", "/login", "/forgot-password", "/reset-password", "/order/", "/cart"],
    },
    sitemap: new URL("/sitemap.xml", serverEnv.appUrl).toString(),
    host: serverEnv.appUrl,
  };
}
