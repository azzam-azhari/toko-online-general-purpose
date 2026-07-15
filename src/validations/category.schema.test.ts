import { describe, expect, it } from "vitest";

import { categoryFormSchema } from "./category.schema";

describe("categoryFormSchema", () => {
  it("menerima field opsional yang kosong", () => {
    const parsed = categoryFormSchema.safeParse({
      name: "Kebutuhan Harian",
      slug: "kebutuhan-harian",
      description: "",
      icon: "",
      parent_id: "",
      is_active: true,
      sort_order: 10,
    });

    expect(parsed.success).toBe(true);
  });

  it("dapat memvalidasi ulang output form tanpa gagal", () => {
    const firstPass = categoryFormSchema.parse({
      name: "Gaya Hidup",
      slug: "gaya-hidup",
      description: "",
      icon: "",
      parent_id: "",
      is_active: true,
      sort_order: 20,
    });

    expect(categoryFormSchema.safeParse(firstPass).success).toBe(true);
  });

  it("menerima kategori bawaan sebagai induk", () => {
    const parsed = categoryFormSchema.safeParse({
      name: "Turunan",
      slug: "turunan",
      parent_id: "00000000-0000-0000-0000-000000000101",
      is_active: true,
      sort_order: 40,
    });

    expect(parsed.success).toBe(true);
  });
});
