import { z } from "zod";

import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/types/operations";
import { databaseUuidSchema } from "@/validations/database.schema";

const optionalText = (max: number) => z.string().trim().max(max).transform((value) => value || undefined);
const optionalInputText = (max: number) => z.preprocess((value) => value ?? "", optionalText(max));
const optionalHttpsUrl = z.string().trim().max(500).refine(
  (value) => !value || /^https:\/\/[^\s]+$/i.test(value),
  "Gunakan URL HTTPS yang valid.",
).transform((value) => value || undefined);

export const orderFiltersSchema = z.object({
  search: z.string().trim().max(80).optional().default(""),
  status: z.enum([...ORDER_STATUSES, "all"] as const).optional().default("all"),
  payment: z.enum([...PAYMENT_STATUSES, "all"] as const).optional().default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
});

export const orderStatusUpdateSchema = z.object({
  order_id: databaseUuidSchema,
  status: z.enum(ORDER_STATUSES),
  note: optionalText(500),
});

export const externalOrderSchema = z.object({
  idempotency_key: databaseUuidSchema,
  sales_channel: z.enum(["whatsapp", "custom_url"]),
  customer_name: z.string().trim().min(1, "Nama pelanggan wajib diisi.").max(120),
  customer_email: z.preprocess((value) => value ?? "", z.string().trim().max(254).refine(
    (value) => !value || z.email().safeParse(value).success,
    "Email pelanggan tidak valid.",
  ).transform((value) => value || undefined)),
  customer_phone: z.string().trim().min(8, "Nomor pelanggan terlalu pendek.").max(24),
  source_reference: optionalInputText(160),
  notes: optionalInputText(1000),
  items: z.array(z.object({
    product_id: databaseUuidSchema,
    quantity: z.coerce.number().int().min(1).max(100),
  })).min(1, "Tambahkan setidaknya satu item.").max(50).refine(
    (items) => new Set(items.map((item) => item.product_id)).size === items.length,
    "Produk yang sama tidak boleh ditambahkan dua kali.",
  ),
});

export const externalPaymentUpdateSchema = z.object({
  order_id: databaseUuidSchema,
  status: z.enum(["pending", "paid", "failed", "expired", "refunded"]),
  reference: optionalInputText(160),
  note: optionalInputText(500),
});

export const publicOrderLookupSchema = z.object({
  order_number: z.string().trim().toUpperCase().min(8).max(80),
  contact: z.string().trim().min(5).max(254),
});

export const bannerSchema = z.object({
  id: databaseUuidSchema.optional(),
  title: z.string().trim().min(1, "Judul wajib diisi.").max(180),
  subtitle: optionalText(500),
  link_label: optionalText(80),
  link_url: optionalHttpsUrl,
  starts_at: optionalText(40),
  ends_at: optionalText(40),
  is_active: z.boolean(),
  sort_order: z.coerce.number().int().min(0).max(9999),
}).superRefine((value, context) => {
  if (value.link_label && !value.link_url) context.addIssue({ code: "custom", path: ["link_url"], message: "URL wajib diisi bila label tombol digunakan." });
  if (value.starts_at && value.ends_at && new Date(value.ends_at) <= new Date(value.starts_at)) {
    context.addIssue({ code: "custom", path: ["ends_at"], message: "Waktu selesai harus setelah waktu mulai." });
  }
});

export const testimonialSchema = z.object({
  id: databaseUuidSchema.optional(),
  author_name: z.string().trim().min(1, "Nama wajib diisi.").max(120),
  author_title: optionalText(160),
  quote: z.string().trim().min(1, "Testimoni wajib diisi.").max(1200),
  rating: z.coerce.number().int().min(1).max(5),
  has_consent: z.boolean(),
  is_active: z.boolean(),
  sort_order: z.coerce.number().int().min(0).max(9999),
}).superRefine((value, context) => {
  if (value.is_active && !value.has_consent) context.addIssue({ code: "custom", path: ["has_consent"], message: "Persetujuan pemilik wajib sebelum diterbitkan." });
});

export const faqSchema = z.object({
  id: databaseUuidSchema.optional(),
  question: z.string().trim().min(1, "Pertanyaan wajib diisi.").max(300),
  answer: z.string().trim().min(1, "Jawaban wajib diisi.").max(3000),
  is_active: z.boolean(),
  sort_order: z.coerce.number().int().min(0).max(9999),
});

export const storeSettingsSchema = z.object({
  store_name: z.string().trim().min(1, "Nama toko wajib diisi.").max(120),
  tagline: optionalText(180),
  description: optionalText(1200),
  contact_email: z.string().trim().max(254).refine((value) => !value || z.email().safeParse(value).success, "Email tidak valid.").transform((value) => value || undefined),
  contact_phone: optionalText(40),
  whatsapp_number: z.string().trim().max(30).refine((value) => !value || /^(?:\+?62|0)8\d{7,12}$/.test(value.replace(/[\s-]/g, "")), "Nomor WhatsApp Indonesia tidak valid.").transform((value) => value || undefined),
  address: optionalText(1000),
  business_hours: optionalText(1000),
  facebook_url: optionalHttpsUrl,
  instagram_url: optionalHttpsUrl,
  currency: z.literal("IDR"),
  timezone: z.literal("Asia/Jakarta"),
  flat_shipping_fee: z.coerce.number().int().min(0).max(1_000_000_000),
  low_stock_threshold: z.coerce.number().int().min(0).max(1_000_000),
  seo_title: optionalText(70),
  seo_description: optionalText(170),
});

export const operationalSettingsSchema = z.object({
  low_stock_threshold: z.coerce.number().int().min(0).max(1_000_000),
});

export type BannerInput = z.infer<typeof bannerSchema>;
export type TestimonialInput = z.infer<typeof testimonialSchema>;
export type FaqInput = z.infer<typeof faqSchema>;
export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>;
export type OperationalSettingsInput = z.infer<typeof operationalSettingsSchema>;
