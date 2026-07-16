import type { Metadata } from "next";
import { CheckCircle2, ChevronRight, PackageCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { serverEnv } from "@/configs/env/server";
import {
  getRelatedProducts,
  getStorefrontProductBySlug,
  getStorefrontSettings,
} from "@/lib/repositories/storefront.repository";
import { buildWhatsAppUrl, formatRupiah, getDiscountPercentage, serializeJsonLd } from "@/lib/storefront";

import { ProductCard } from "../../_components/product-card";
import { ProductGallery } from "../../_components/product-gallery";
import { PurchaseButton } from "../../_components/purchase-button";
import { ShareButtons } from "../../_components/share-buttons";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getStorefrontProductBySlug(slug);
  if (!product) return { title: "Produk tidak ditemukan", robots: { index: false, follow: false } };

  const title = product.seo_title || product.name;
  const description = product.seo_description || product.short_description || undefined;
  const canonical = `/products/${product.slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      images: product.images[0]?.url ? [{ url: product.images[0].url, alt: product.images[0].alt_text || product.name }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: product.images[0]?.url ? [product.images[0].url] : undefined },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getStorefrontProductBySlug(slug), getStorefrontSettings()]);
  if (!product || product.cta_type === "midtrans") notFound();

  const relatedProducts = await getRelatedProducts(product, 4);
  const productUrl = new URL(`/products/${product.slug}`, serverEnv.appUrl).toString();
  const ctaHref = product.cta_type === "custom_url"
    ? product.custom_url
    : product.cta_type === "whatsapp"
      ? buildWhatsAppUrl({ product, settings, productUrl, fallbackNumber: process.env.NEXT_PUBLIC_DEFAULT_WHATSAPP_NUMBER })
      : null;
  const discount = getDiscountPercentage(product.price, product.compare_at_price);
  const purchaseProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    imageUrl: product.images[0]?.url ?? null,
    availableStock: product.available_stock,
    ctaType: product.cta_type,
  };
  const purchaseLabel = product.cta_type === "whatsapp" ? "Beli via WhatsApp" : "Beli di Situs Mitra";
  const purchaseHint = product.cta_type === "whatsapp"
    ? "Pembelian akan dilanjutkan melalui percakapan WhatsApp."
    : "Pembelian akan dilanjutkan di situs mitra resmi.";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.short_description,
    sku: product.sku,
    image: product.images.map((image) => image.url),
    category: product.categories.map((category) => category.name).join(", ") || undefined,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: settings.currency,
      price: product.price,
      availability: product.available_stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: serverEnv.appUrl },
      { "@type": "ListItem", position: 2, name: "Katalog", item: new URL("/products", serverEnv.appUrl).toString() },
      { "@type": "ListItem", position: 3, name: product.name, item: productUrl },
    ],
  };

  return (
    <main>
      <script dangerouslySetInnerHTML={{ __html: serializeJsonLd(productJsonLd) }} type="application/ld+json" />
      <script dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }} type="application/ld+json" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Link className="hover:text-foreground" href="/">Beranda</Link><ChevronRight aria-hidden="true" className="size-3" />
          <Link className="hover:text-foreground" href="/products">Katalog</Link><ChevronRight aria-hidden="true" className="size-3" />
          <span aria-current="page" className="max-w-56 truncate text-foreground">{product.name}</span>
        </nav>

        <section className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images} productName={product.name} />

          <div className="lg:py-4">
            <div className="flex flex-wrap gap-2">
              {product.categories.map((category) => <Badge key={category.id} variant="secondary">{category.name}</Badge>)}
              {discount ? <Badge className="bg-accent text-white">Hemat {discount}%</Badge> : null}
            </div>
            <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">{product.name}</h1>
            <p className="mt-3 text-sm text-muted-foreground">Kode Produk: {product.sku}</p>
            {product.short_description ? <p className="mt-5 text-base leading-8 text-muted-foreground">{product.short_description}</p> : null}

            <div className="mt-7 flex flex-wrap items-baseline gap-3">
              <strong className="text-3xl text-primary">{formatRupiah(product.price)}</strong>
              {product.compare_at_price ? <del className="text-lg text-muted-foreground">{formatRupiah(product.compare_at_price)}</del> : null}
            </div>

            <div className="mt-5 flex items-center gap-2 text-sm font-semibold">
              {product.available_stock > 0 ? <><CheckCircle2 aria-hidden="true" className="size-4 text-primary" /><span>{product.available_stock} stok tersedia</span></> : <><span className="size-2 rounded-full bg-destructive" /><span>Stok habis</span></>}
            </div>

            <p className="mt-8 text-sm text-muted-foreground">{purchaseHint}</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <PurchaseButton
                className="w-full sm:w-auto sm:min-w-44"
                href={ctaHref}
                label={purchaseLabel}
                openInNewTab={product.open_in_new_tab}
                product={purchaseProduct}
              />
            </div>

            <div className="mt-8 border-t pt-7"><ShareButtons instagramUrl={settings.instagram_url} productName={product.name} url={productUrl} /></div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <Card className="shadow-none"><CardContent className="p-4"><PackageCheck aria-hidden="true" className="size-5 text-primary" /><p className="mt-3 text-sm font-bold">Stok terlihat jelas</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Ketersediaan ditampilkan dari katalog aktif.</p></CardContent></Card>
              <Card className="shadow-none"><CardContent className="p-4"><ShieldCheck aria-hidden="true" className="size-5 text-primary" /><p className="mt-3 text-sm font-bold">Tujuan beli terarah</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Tombol mengikuti konfigurasi produk.</p></CardContent></Card>
            </div>
          </div>
        </section>

        <section className="mt-20 border-t pt-12">
          <h2 className="font-serif text-3xl">Deskripsi Produk</h2>
          <div className="mt-5 max-w-3xl whitespace-pre-line text-sm leading-8 text-muted-foreground">
            {product.description || product.short_description || "Deskripsi produk belum tersedia."}
          </div>
        </section>

        {relatedProducts.length ? (
          <section className="mt-20 border-t pt-12">
            <div className="flex items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[.16em] text-accent">Lanjut menjelajah</p><h2 className="mt-2 font-serif text-3xl sm:text-4xl">Produk Terkait</h2></div><Link className="text-sm font-bold text-primary" href="/products">Lihat semua</Link></div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">{relatedProducts.map((item) => <ProductCard key={item.id} product={item} />)}</div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
