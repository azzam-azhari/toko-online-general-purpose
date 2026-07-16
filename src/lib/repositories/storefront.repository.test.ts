import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createClient: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));

import {
  loadStorefrontCategories,
  loadStorefrontSettings,
  StorefrontRepositoryError,
} from "./storefront.repository";

type QueryResult = { data: unknown; error: unknown };

function query(result: QueryResult) {
  const builder: Record<string, unknown> = {};
  for (const method of ["select", "eq", "is", "order", "limit"]) {
    builder[method] = vi.fn(() => builder);
  }
  builder.maybeSingle = vi.fn(async () => result);
  builder.then = (resolve: (value: QueryResult) => unknown, reject: (reason: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject);
  return builder;
}

function mockTables(results: Record<string, QueryResult>) {
  mocks.createClient.mockResolvedValue({
    from: (table: string) => query(results[table]),
  });
}

describe("storefront repository fallbacks", () => {
  beforeEach(() => mocks.createClient.mockReset());

  it("mempertahankan cause asli pada StorefrontRepositoryError", () => {
    const cause = { code: "PGRST301", message: "upstream unavailable" };
    const error = new StorefrontRepositoryError("Storefront gagal.", cause);

    expect(error.cause).toBe(cause);
  });

  it("menggunakan profil bawaan dan mencatat error asli ketika profil gagal dimuat", async () => {
    const sourceError = { code: "PGRST001", message: "database unavailable", details: "connection refused" };
    mockTables({ store_settings: { data: null, error: sourceError } });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const settings = await loadStorefrontSettings();

    expect(settings.store_name).toBe("NusaMart");
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("loadStorefrontSettings"),
      expect.objectContaining({ code: sourceError.code, message: sourceError.message }),
    );
    consoleSpy.mockRestore();
  });

  it("tetap menampilkan kategori dengan jumlah nol ketika agregasi produk gagal", async () => {
    const sourceError = { code: "PGRST200", message: "relationship missing" };
    mockTables({
      categories: {
        data: [{ id: "category-id", name: "Kategori", slug: "kategori", description: null, image_path: null, icon: null, sort_order: 0 }],
        error: null,
      },
      product_categories: { data: null, error: sourceError },
    });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(loadStorefrontCategories()).resolves.toEqual([
      expect.objectContaining({ id: "category-id", product_count: 0 }),
    ]);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("loadStorefrontCategories.productCounts"),
      expect.objectContaining({ code: sourceError.code, message: sourceError.message }),
    );
    consoleSpy.mockRestore();
  });

  it("menggunakan daftar kosong ketika query kategori gagal", async () => {
    mockTables({
      categories: { data: null, error: { code: "DB_DOWN", message: "connection refused" } },
      product_categories: { data: [], error: null },
    });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(loadStorefrontCategories()).resolves.toEqual([]);
    consoleSpy.mockRestore();
  });
});
