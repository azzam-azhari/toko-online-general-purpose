import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  ActivityLog,
  Category,
  CategoryWithProductCount,
  DashboardOverview,
  Product,
  ProductImage,
  ProductStatus,
} from "@/types/catalog";
import { databaseUuidSchema } from "@/validations/database.schema";

const PRODUCT_LIST_SELECT =
  "id, name, slug, sku, short_description, description, price, compare_at_price, stock, reserved_stock, status, is_featured, sort_order, seo_title, seo_description, cta_type, cta_label, custom_url, whatsapp_number, whatsapp_template, open_in_new_tab, created_at, updated_at, product_images(id, storage_path, alt_text, sort_order, is_primary), product_categories(category_id)";

type ProductRow = Omit<Product, "product_images" | "category_ids"> & {
  product_images: Omit<ProductImage, "url" | "public_url">[] | null;
  product_categories: { category_id: string }[] | null;
};

type ActivityRow = Omit<ActivityLog, "actor_name"> & {
  actor: { full_name: string | null } | { full_name: string | null }[] | null;
};

export class CatalogRepositoryError extends Error {
  constructor(message = "Data katalog belum dapat dimuat.") {
    super(message);
    this.name = "CatalogRepositoryError";
  }
}

function sanitizeSearch(value: string) {
  return value.replace(/[%_,().]/g, " ").trim().slice(0, 80);
}

function getImageUrl(baseUrl: string, storagePath: string) {
  return `${baseUrl}/storage/v1/object/public/product-images/${storagePath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

function mapProduct(row: ProductRow, supabaseUrl: string): Product {
  return {
    ...row,
    price: Number(row.price),
    compare_at_price: row.compare_at_price === null ? null : Number(row.compare_at_price),
    product_images: (row.product_images ?? [])
      .map((image) => ({
        ...image,
        public_url: null,
        url: getImageUrl(supabaseUrl, image.storage_path),
      }))
      .sort((a, b) => a.sort_order - b.sort_order),
    category_ids: (row.product_categories ?? []).map((item) => item.category_id),
  };
}

export async function getCategories(): Promise<CategoryWithProductCount[]> {
  const supabase = await createClient();
  const [categoriesResult, productLinksResult] = await Promise.all([
    supabase
      .from("categories")
      .select("id, parent_id, name, slug, description, icon, image_path, is_active, sort_order, created_at, updated_at")
      .is("deleted_at", null)
      .order("sort_order")
      .order("name"),
    supabase
      .from("product_categories")
      .select("category_id, products!inner(id)")
      .is("products.deleted_at", null),
  ]);

  if (categoriesResult.error || productLinksResult.error) {
    throw new CatalogRepositoryError("Kategori belum dapat dimuat.");
  }

  const counts = new Map<string, number>();
  for (const row of productLinksResult.data ?? []) {
    counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1);
  }

  return ((categoriesResult.data ?? []) as Category[]).map((category) => ({
    ...category,
    product_count: counts.get(category.id) ?? 0,
  }));
}

export async function getProducts(options?: {
  search?: string;
  status?: ProductStatus | "all";
  categoryId?: string;
  page?: number;
  pageSize?: number;
}) {
  const supabase = await createClient();
  const page = Math.max(options?.page ?? 1, 1);
  const pageSize = Math.min(Math.max(options?.pageSize ?? 20, 1), 50);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const parsedCategoryId = databaseUuidSchema.safeParse(options?.categoryId);
  const categoryId = parsedCategoryId.success ? parsedCategoryId.data : undefined;

  let query = supabase
    .from("products")
    .select(
      categoryId
        ? `${PRODUCT_LIST_SELECT}, category_filter:product_categories!inner(category_id)`
        : PRODUCT_LIST_SELECT,
      { count: "exact" },
    )
    .is("deleted_at", null);

  const search = sanitizeSearch(options?.search ?? "");
  if (search) query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,slug.ilike.%${search}%`);
  if (options?.status && options.status !== "all") query = query.eq("status", options.status);
  if (categoryId) query = query.eq("category_filter.category_id", categoryId);

  const { data, error, count } = await query.order("updated_at", { ascending: false }).range(from, to);

  if (error) throw new CatalogRepositoryError("Daftar produk belum dapat dimuat.");

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return {
    products: ((data ?? []) as unknown as ProductRow[]).map((row) => mapProduct(row, baseUrl)),
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, slug, sku, short_description, description, price, compare_at_price, stock, reserved_stock, status, is_featured, sort_order, seo_title, seo_description, cta_type, cta_label, custom_url, whatsapp_number, whatsapp_template, open_in_new_tab, created_at, updated_at, product_images(id, storage_path, alt_text, sort_order, is_primary), product_categories(category_id)",
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw new CatalogRepositoryError("Produk belum dapat dimuat.");
  if (!data) return null;

  return mapProduct(data as ProductRow, process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
}

export async function getActivityLogs(limit = 30): Promise<ActivityLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_logs")
    .select(
      "id, actor_id, action, entity_type, entity_id, before_data, after_data, created_at, actor:profiles!activity_logs_actor_id_fkey(full_name)",
    )
    .order("created_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 100));

  if (error) throw new CatalogRepositoryError("Activity log belum dapat dimuat.");

  return ((data ?? []) as ActivityRow[]).map((row) => {
    const actor = Array.isArray(row.actor) ? row.actor[0] : row.actor;
    return {
      id: row.id,
      actor_id: row.actor_id,
      action: row.action,
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      before_data: row.before_data,
      after_data: row.after_data,
      created_at: row.created_at,
      actor_name: actor?.full_name ?? null,
    };
  });
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const supabase = await createClient();
  const countProducts = (status?: ProductStatus) => {
    let query = supabase.from("products").select("id", { count: "exact", head: true }).is("deleted_at", null);
    if (status) query = query.eq("status", status);
    return query;
  };

  const [total, active, draft, inactive, categories, settings, stockRows, recentActivity] = await Promise.all([
    countProducts(),
    countProducts("active"),
    countProducts("draft"),
    countProducts("inactive"),
    supabase.from("categories").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase
      .from("store_settings")
      .select("store_name, description, contact_phone, whatsapp_number, low_stock_threshold")
      .limit(1)
      .maybeSingle(),
    supabase.from("products").select("stock, reserved_stock").is("deleted_at", null).neq("status", "archived"),
    getActivityLogs(6),
  ]);

  const queryErrors = [total.error, active.error, draft.error, inactive.error, categories.error, settings.error, stockRows.error];
  if (queryErrors.some(Boolean)) throw new CatalogRepositoryError("Ringkasan dashboard belum dapat dimuat.");

  const threshold = settings.data?.low_stock_threshold ?? 5;
  const lowStockProducts = (stockRows.data ?? []).filter(
    (product) => product.stock - product.reserved_stock <= threshold,
  ).length;

  return {
    totalProducts: total.count ?? 0,
    activeProducts: active.count ?? 0,
    draftProducts: draft.count ?? 0,
    inactiveProducts: inactive.count ?? 0,
    totalCategories: categories.count ?? 0,
    lowStockProducts,
    storeProfileComplete: Boolean(
      settings.data?.store_name &&
        settings.data?.description &&
        (settings.data?.contact_phone || settings.data?.whatsapp_number),
    ),
    recentActivity,
  };
}
