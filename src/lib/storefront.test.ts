import { describe, expect, it } from "vitest";

import { buildWhatsAppUrl, getDiscountPercentage, normalizeWhatsAppNumber, parseCatalogPriceFilter, serializeJsonLd } from "@/lib/storefront";
import type { StorefrontProduct, StorefrontSettings } from "@/types/storefront";

const product = {
  id: "product-1",
  name: "Botol Minum",
  slug: "botol-minum",
  sku: "BTL-1",
  short_description: null,
  description: null,
  price: 89000,
  compare_at_price: 109000,
  stock: 10,
  reserved_stock: 2,
  available_stock: 8,
  is_featured: true,
  seo_title: null,
  seo_description: null,
  cta_type: "whatsapp",
  cta_label: "Pesan",
  custom_url: null,
  whatsapp_number: "0812-3456-7890",
  whatsapp_template: "Saya ingin {product_name} ({product_sku}) dari {store_name}: {product_url}",
  open_in_new_tab: false,
  created_at: "2026-07-15T00:00:00.000Z",
  images: [],
  categories: [],
} satisfies StorefrontProduct;

const settings = {
  id: "settings-1",
  store_name: "NusaMart",
  tagline: null,
  description: null,
  logo_path: null,
  favicon_path: null,
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
} satisfies StorefrontSettings;

describe("storefront helpers", () => {
  it("normalizes Indonesian WhatsApp numbers", () => {
    expect(normalizeWhatsAppNumber("0812-3456-7890")).toBe("6281234567890");
    expect(normalizeWhatsAppNumber("812 3456 7890")).toBe("6281234567890");
    expect(normalizeWhatsAppNumber("123")).toBeNull();
  });

  it("builds an encoded WhatsApp message from trusted product data", () => {
    const url = buildWhatsAppUrl({
      product,
      settings,
      productUrl: "https://nusamart.test/products/botol-minum",
    });

    expect(url).toContain("https://wa.me/6281234567890?text=");
    expect(decodeURIComponent(url ?? "")).toContain("Saya ingin Botol Minum (BTL-1) dari NusaMart");
  });

  it("only returns discounts for a valid comparison price", () => {
    expect(getDiscountPercentage(75000, 100000)).toBe(25);
    expect(getDiscountPercentage(100000, 100000)).toBeNull();
  });

  it("does not turn an empty catalog price filter into zero", () => {
    expect(parseCatalogPriceFilter(undefined)).toBeUndefined();
    expect(parseCatalogPriceFilter("")).toBeUndefined();
    expect(parseCatalogPriceFilter("   ")).toBeUndefined();
    expect(parseCatalogPriceFilter("25000")).toBe(25000);
    expect(parseCatalogPriceFilter("-1")).toBeUndefined();
  });

  it("escapes HTML-sensitive characters in JSON-LD", () => {
    expect(serializeJsonLd({ name: "</script><script>alert(1)</script>" })).not.toContain("</script>");
    expect(serializeJsonLd({ name: "</script>" })).toContain("\\u003c/script>");
  });
});
