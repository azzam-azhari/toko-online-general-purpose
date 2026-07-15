import type { Metadata } from "next";

import { serverEnv } from "@/configs/env/server";
import { CatalogRealtimeRefresh } from "@/components/common/catalog-realtime-refresh";
import { getStorefrontSettings } from "@/lib/repositories/storefront.repository";
import { getPublicAssetUrl } from "@/lib/storefront";

import { CartProvider } from "./_components/cart-provider";
import { StorefrontFooter } from "./_components/storefront-footer";
import { StorefrontHeader } from "./_components/storefront-header";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStorefrontSettings();
  const title = settings.seo_title || settings.store_name;
  const description = settings.seo_description || settings.description || undefined;
  const faviconUrl = getPublicAssetUrl(settings.asset_base_url, "store-assets", settings.favicon_path);

  return {
    metadataBase: new URL(serverEnv.appUrl),
    title: { default: title, template: `%s | ${settings.store_name}` },
    description,
    icons: { icon: faviconUrl ?? "/favicon.ico" },
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: settings.store_name,
      title,
      description,
      url: "/",
      images: [{ url: "/og.png", width: 1736, height: 909, alt: `${settings.store_name} — ${settings.tagline ?? "Pilihan Tepat, Hidup Lebih Hebat"}` }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  };
}

export default async function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getStorefrontSettings();
  const logoUrl = getPublicAssetUrl(settings.asset_base_url, "store-assets", settings.logo_path) ?? "/logo/nusamart-logo.png";

  return (
    <CartProvider>
      <CatalogRealtimeRefresh scope="public" />
      <div className="min-h-screen bg-background text-foreground">
        <StorefrontHeader logoUrl={logoUrl} storeName={settings.store_name} />
        {children}
        <StorefrontFooter settings={settings} />
      </div>
    </CartProvider>
  );
}
