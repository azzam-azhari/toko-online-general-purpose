import type { StorefrontProduct, StorefrontSettings } from "@/types/storefront";

export const DEFAULT_STORE_SETTINGS: StorefrontSettings = {
  id: "00000000-0000-0000-0000-000000000001",
  store_name: "NusaMart",
  tagline: "Pilihan Tepat, Hidup Lebih Hebat",
  description: "Produk pilihan untuk membuat belanja kebutuhan harian dan gaya hidup terasa lebih praktis.",
  logo_path: null,
  contact_email: null,
  contact_phone: null,
  whatsapp_number: null,
  address: null,
  business_hours: null,
  facebook_url: null,
  instagram_url: null,
  currency: "IDR",
  flat_shipping_fee: 0,
  seo_title: null,
  seo_description: null,
  asset_base_url: "",
};

export function normalizeWhatsAppNumber(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;

  const normalized = digits.startsWith("0")
    ? `62${digits.slice(1)}`
    : digits.startsWith("8")
      ? `62${digits}`
      : digits;

  return normalized.length >= 10 && normalized.length <= 15 ? normalized : null;
}

export function buildWhatsAppUrl({
  product,
  settings,
  productUrl,
  fallbackNumber,
}: {
  product: StorefrontProduct;
  settings: StorefrontSettings;
  productUrl: string;
  fallbackNumber?: string;
}): string | null {
  const number = normalizeWhatsAppNumber(
    product.whatsapp_number ?? settings.whatsapp_number ?? fallbackNumber ?? "",
  );
  if (!number) return null;

  const template =
    product.whatsapp_template ??
    "Halo, saya tertarik membeli {product_name} dengan harga {product_price}. Detail: {product_url}";
  const message = template
    .replaceAll("{product_name}", product.name)
    .replaceAll("{product_price}", formatRupiah(product.price))
    .replaceAll("{product_url}", productUrl)
    .replaceAll("{product_sku}", product.sku)
    .replaceAll("{store_name}", settings.store_name);

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getDiscountPercentage(price: number, compareAtPrice: number | null): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export function getPublicAssetUrl(baseUrl: string, bucket: string, path: string | null) {
  if (!path) return null;
  if (/^https:\/\//i.test(path)) return path;
  if (!baseUrl) return null;

  const safePath = path
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
  return `${baseUrl}/storage/v1/object/public/${bucket}/${safePath}`;
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
