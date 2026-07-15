import { describe, expect, it } from "vitest";

import { bannerSchema, orderStatusUpdateSchema, storeSettingsSchema, testimonialSchema } from "./operations.schema";

describe("validasi operasional", () => {
  it("mewajibkan persetujuan untuk testimoni aktif", () => {
    const parsed = testimonialSchema.safeParse({ author_name: "Ayu", quote: "Pelayanannya baik.", rating: 5, has_consent: false, is_active: true, sort_order: 0 });
    expect(parsed.success).toBe(false);
  });

  it("menolak jadwal banner yang berakhir sebelum mulai", () => {
    const parsed = bannerSchema.safeParse({ title: "Promo", starts_at: "2026-07-20T10:00", ends_at: "2026-07-19T10:00", is_active: true, sort_order: 0 });
    expect(parsed.success).toBe(false);
  });

  it("menerima status order dan catatan yang valid", () => {
    expect(orderStatusUpdateSchema.safeParse({ order_id: "00000000-0000-0000-0000-000000000201", status: "processing", note: "Pesanan sedang dikemas." }).success).toBe(true);
  });

  it("mengunci mata uang dan zona waktu sesuai keputusan produk", () => {
    const parsed = storeSettingsSchema.safeParse({ store_name: "NusaMart", contact_email: "", contact_phone: "", whatsapp_number: "081234567890", address: "", business_hours: "", facebook_url: "", instagram_url: "", currency: "IDR", timezone: "Asia/Jakarta", flat_shipping_fee: 0, low_stock_threshold: 5, seo_title: "", seo_description: "", tagline: "", description: "" });
    expect(parsed.success).toBe(true);
    expect(storeSettingsSchema.safeParse({ ...(parsed.success ? parsed.data : {}), currency: "USD" }).success).toBe(false);
  });
});
