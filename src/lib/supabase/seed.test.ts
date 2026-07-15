import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const seed = readFileSync(join(process.cwd(), "supabase", "seed.sql"), "utf8");

describe("Supabase development seed", () => {
  it("memuat tiga kategori dummy", () => {
    expect(seed).toContain("'Kebutuhan Harian'");
    expect(seed).toContain("'Gaya Hidup'");
    expect(seed).toContain("'Elektronik & Aksesori'");
  });

  it("memuat tiga produk unik untuk setiap kategori", () => {
    const skus = [
      "KH-BTL-001",
      "KH-KMK-002",
      "KH-HDK-003",
      "GH-TBG-001",
      "GH-DFS-002",
      "GH-TMB-003",
      "EL-LMP-001",
      "EL-KBL-002",
      "EL-EAR-003",
    ];

    for (const sku of skus) expect(seed).toContain(`'${sku}'`);

    for (const categorySuffix of ["101", "102", "103"]) {
      const matches = seed.match(
        new RegExp(`'00000000-0000-0000-0000-000000000${categorySuffix}'\\)`, "g"),
      );
      expect(matches).toHaveLength(3);
    }
  });

  it("hanya mengaktifkan WhatsApp dan tautan eksternal pada Phase 6", () => {
    expect(seed).not.toContain("'midtrans'");
    expect(seed).toContain("'whatsapp'");
    expect(seed).toContain("'custom_url'");
  });
});
