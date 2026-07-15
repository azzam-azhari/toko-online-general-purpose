import { z } from "zod";

import { databaseUuidSchema } from "@/validations/database.schema";

export const categoryFormSchema = z.object({
  name: z.string().trim().min(2, "Nama kategori minimal 2 karakter.").max(120),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Gunakan huruf kecil, angka, dan tanda hubung."),
  description: z.string().trim().max(500).optional().transform((value) => value || undefined),
  icon: z.string().trim().max(60).optional().transform((value) => value || undefined),
  parent_id: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    databaseUuidSchema.optional(),
  ),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).max(999999).default(0),
});

export type CategoryFormInput = z.input<typeof categoryFormSchema>;
export type CategoryFormValues = z.output<typeof categoryFormSchema>;
