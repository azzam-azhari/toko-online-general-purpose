import { z } from "zod";

import { databaseUuidSchema } from "@/validations/database.schema";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || undefined);

const optionalInteger = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.coerce.number().int().min(0).optional(),
);

const optionalHttpsUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.url("Masukkan URL yang valid.").refine((value) => new URL(value).protocol === "https:", {
    message: "URL wajib menggunakan https://.",
  }).optional(),
);

export const productFormSchema = z
  .object({
    name: z.string().trim().min(2, "Nama produk minimal 2 karakter.").max(180),
    slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Gunakan huruf kecil, angka, dan tanda hubung."),
    sku: z.string().trim().min(1, "SKU wajib diisi.").max(80),
    short_description: optionalText(240),
    description: optionalText(5000),
    price: z.coerce.number().int("Harga harus berupa angka bulat.").min(0, "Harga tidak boleh negatif."),
    compare_at_price: optionalInteger,
    stock: z.coerce.number().int("Stok harus berupa angka bulat.").min(0, "Stok tidak boleh negatif."),
    status: z.enum(["draft", "active", "inactive"]),
    is_featured: z.boolean().default(false),
    sort_order: z.coerce.number().int().min(0).max(999999).default(0),
    seo_title: optionalText(70),
    seo_description: optionalText(160),
    cta_type: z.enum(["custom_url", "whatsapp"], {
      message: "Phase 6 hanya mendukung WhatsApp dan tautan eksternal.",
    }),
    cta_label: z.string().trim().min(2, "Label tombol wajib diisi.").max(40),
    custom_url: optionalHttpsUrl,
    whatsapp_number: optionalText(24).refine(
      (value) => !value || /^\+?[0-9\s()-]{8,24}$/.test(value),
      "Masukkan nomor WhatsApp yang valid.",
    ),
    whatsapp_template: optionalText(500),
    open_in_new_tab: z.boolean().default(false),
    category_ids: z.array(databaseUuidSchema).max(30).default([]),
  })
  .superRefine((value, context) => {
    if (value.compare_at_price !== undefined && value.compare_at_price <= value.price) {
      context.addIssue({
        code: "custom",
        path: ["compare_at_price"],
        message: "Harga sebelum diskon harus lebih tinggi daripada harga jual.",
      });
    }

    if (value.cta_type === "custom_url" && !value.custom_url) {
      context.addIssue({
        code: "custom",
        path: ["custom_url"],
        message: "URL tujuan wajib diisi untuk tipe tautan eksternal.",
      });
    }
  });

export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormValues = z.output<typeof productFormSchema>;
