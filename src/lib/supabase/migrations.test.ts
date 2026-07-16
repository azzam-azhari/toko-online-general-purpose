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

    expect(migrations).toHaveLength(19);
    expect(migrations[0]).toContain("extensions");
    expect(migrations.at(-1)).toContain("service_role_privileges");
    expect(new Set(migrations.map((entry) => entry.slice(0, 14))).size).toBe(migrations.length);
  });

  it("menghitung stok tersedia di database untuk filter dan pagination yang akurat", () => {
    const availableStock = readMigration("available_stock.sql");

    expect(availableStock).toContain("generated always as (stock - reserved_stock) stored");
    expect(availableStock).toContain("products_available_stock_idx");
  });

  it("memberi service role hanya akses baca yang dibutuhkan endpoint server", () => {
    const privileges = readMigration("service_role_privileges.sql");

    expect(privileges).toContain("grant usage on schema public to service_role");
    for (const table of ["store_settings", "categories", "products", "orders", "order_items"]) {
      expect(privileges).toContain(`public.${table}`);
    }
    expect(privileges).toContain("grant select on");
    expect(privileges).not.toMatch(/grant\s+(insert|update|delete|all)/);
  });

  it("menambahkan kontrol operasional transaksional dan menunda Midtrans", () => {
    const operations = readMigration("operations.sql");
    expect(operations).toContain("create table public.order_status_history");
    expect(operations).toContain("function public.update_order_status");
    expect(operations).toContain("function public.save_store_settings");
    expect(operations).toContain("insert into public.activity_logs");
    expect(operations).toContain("products_phase_6_cta_only");
  });

  it("mencatat order dan pembayaran hanya melalui kanal eksternal pada Fase 8", () => {
    const production = readMigration("checkout_production.sql");

    expect(production).toContain("function public.create_external_order");
    expect(production).toContain("function public.update_external_payment_status");
    expect(production).toContain("products_external_cta_only");
    expect(production).toContain("payment_transactions_external_provider");
    expect(production).toContain("provider in ('whatsapp', 'custom_url')");
    expect(production).toContain("insert into public.order_items");
    expect(production).toContain("insert into public.payment_transactions");
    expect(production).toContain("insert into public.activity_logs");
    expect(production).not.toContain("midtrans_server_key");
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

  it("menghapus produk dan kategori secara permanen dengan audit serta cleanup path", () => {
    const deletion = readMigration("permanent_catalog_deletion.sql");

    expect(deletion).toContain("function public.delete_catalog_product");
    expect(deletion).toContain("function public.delete_catalog_category");
    expect(deletion).toContain("delete from public.products");
    expect(deletion).toContain("delete from public.categories");
    expect(deletion).toContain("'product.deleted'");
    expect(deletion).toContain("'category.deleted'");
    expect(deletion).toContain("'storage_paths'");
    expect(deletion).toContain("private.is_active_admin()");
    expect(deletion).toContain("products_archived_requires_deleted_at");
    expect(deletion).toContain("drop function if exists public.archive_catalog_product");
    expect(deletion).toContain("drop function if exists public.archive_catalog_category");
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

  it("mencegah user Auth baru menjadi admin aktif secara otomatis", () => {
    const security = readMigration("quality_security.sql");

    expect(security).toContain("new.raw_app_meta_data ->> 'role'");
    expect(security).toContain("= 'admin'");
    expect(security).toContain("store_settings_public_select");
    expect(security).toContain("for select to anon");
    expect(security).toContain("store_settings_admin_select");
    expect(security).toContain("private.is_active_admin()");
    expect(security).not.toContain("image/svg+xml");
  });
});
