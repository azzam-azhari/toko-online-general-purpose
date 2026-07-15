import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migrationsDirectory = join(process.cwd(), "supabase", "migrations");

function readMigration(namePart: string) {
  const file = readdirSync(migrationsDirectory).find((entry) => entry.includes(namePart));
  if (!file) throw new Error(`Migration ${namePart} tidak ditemukan.`);
  return readFileSync(join(migrationsDirectory, file), "utf8").toLowerCase();
}

describe("Supabase migrations", () => {
  it("menyimpan migration dengan urutan timestamp yang konsisten", () => {
    const migrations = readdirSync(migrationsDirectory).filter((entry) => entry.endsWith(".sql")).sort();

    expect(migrations).toHaveLength(14);
    expect(migrations[0]).toContain("extensions");
    expect(migrations.at(-1)).toContain("operations");
    expect(new Set(migrations.map((entry) => entry.slice(0, 14))).size).toBe(migrations.length);
  });

  it("menambahkan kontrol operasional transaksional dan menunda Midtrans", () => {
    const operations = readMigration("operations.sql");
    expect(operations).toContain("create table public.order_status_history");
    expect(operations).toContain("function public.update_order_status");
    expect(operations).toContain("function public.save_store_settings");
    expect(operations).toContain("insert into public.activity_logs");
    expect(operations).toContain("products_phase_6_cta_only");
  });

  it("menyiarkan perubahan katalog tanpa mengekspos isi baris", () => {
    const realtime = readMigration("realtime_catalog.sql");

    expect(realtime).toContain("realtime.send");
    expect(realtime).toContain("'catalog_changed'");
    expect(realtime).toContain("'catalog'");
    expect(realtime).toContain("after insert or update or delete on public.products");
    expect(realtime).toContain("after insert or update or delete on public.categories");
    expect(realtime).not.toContain("to_jsonb(new)");
    expect(realtime).not.toContain("to_jsonb(old)");
  });

  it("menyimpan mutasi katalog dan activity log dalam fungsi transaksional", () => {
    const catalogFunctions = readMigration("catalog_functions.sql");

    expect(catalogFunctions).toContain("function public.save_catalog_product");
    expect(catalogFunctions).toContain("function public.save_catalog_category");
    expect(catalogFunctions).toContain("insert into public.activity_logs");
    expect(catalogFunctions).toContain("private.is_active_admin()");
    expect(catalogFunctions).toContain("public_url text");
    expect(catalogFunctions).toContain("url publik gambar wajib valid");
  });

  it("mengaktifkan dan memaksa RLS pada semua tabel aplikasi", () => {
    const rls = readMigration("_rls.sql");
    const tables = [
      "profiles",
      "products",
      "product_images",
      "categories",
      "product_categories",
      "orders",
      "order_items",
      "payment_transactions",
      "banners",
      "testimonials",
      "faqs",
      "store_settings",
      "activity_logs",
    ];

    for (const table of tables) {
      expect(rls).toContain(`alter table public.${table} enable row level security`);
      expect(rls).toContain(`alter table public.${table} force row level security`);
    }
  });

  it("tidak memberi akses order, payment, atau activity log kepada anon", () => {
    const rls = readMigration("_rls.sql");

    expect(rls).not.toMatch(/grant\s+[^;]+on\s+public\.orders\s+to\s+anon/);
    expect(rls).not.toMatch(/grant\s+[^;]+on\s+public\.payment_transactions\s+to\s+anon/);
    expect(rls).not.toMatch(/grant\s+[^;]+on\s+public\.activity_logs\s+to\s+anon/);
    expect(rls).not.toContain("activity_logs_admin_update");
    expect(rls).not.toContain("activity_logs_admin_delete");
  });
});
