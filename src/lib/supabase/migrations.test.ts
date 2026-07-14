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

    expect(migrations).toHaveLength(11);
    expect(migrations[0]).toContain("extensions");
    expect(migrations.at(-1)).toContain("storage");
    expect(new Set(migrations.map((entry) => entry.slice(0, 14))).size).toBe(migrations.length);
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

