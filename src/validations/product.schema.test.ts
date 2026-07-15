import { describe, expect, it } from "vitest";

import { productFormSchema } from "./product.schema";

const validProduct = {
  name: "Tas Harian",
  slug: "tas-harian",
  sku: "TAS-001",
  price: 100000,
  compare_at_price: 125000,
  stock: 10,
  status: "draft" as const,
  is_featured: false,
  sort_order: 0,
  cta_type: "whatsapp" as const,
  cta_label: "Beli Sekarang",
  open_in_new_tab: false,
  category_ids: [],
};

describe("productFormSchema", () => {
  it("menolak status arsip karena penghapusan katalog sekarang permanen", () => {
    const result = productFormSchema.safeParse({ ...validProduct, status: "archived" });

    expect(result.success).toBe(false);
  });

  it("menerima harga pembanding yang lebih tinggi", () => {
    expect(productFormSchema.safeParse(validProduct).success).toBe(true);
  });

  it("menerima produk tanpa kategori", () => {
    expect(productFormSchema.safeParse({ ...validProduct, category_ids: [] }).success).toBe(true);
  });

  it("menerima ID kategori bawaan yang valid di PostgreSQL", () => {
    const parsed = productFormSchema.safeParse({
      ...validProduct,
      category_ids: ["00000000-0000-0000-0000-000000000101"],
    });

    expect(parsed.success).toBe(true);
  });

  it("menolak harga pembanding yang tidak lebih tinggi", () => {
    const parsed = productFormSchema.safeParse({ ...validProduct, compare_at_price: 90000 });
    expect(parsed.success).toBe(false);
  });

  it("mewajibkan URL https untuk CTA tautan eksternal", () => {
    const parsed = productFormSchema.safeParse({
      ...validProduct,
      cta_type: "custom_url",
      custom_url: "http://example.com",
    });
    expect(parsed.success).toBe(false);
  });

  it("menonaktifkan CTA Midtrans sampai Phase 8", () => {
    expect(productFormSchema.safeParse({ ...validProduct, cta_type: "midtrans" }).success).toBe(false);
  });
});
