import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import { DEFAULT_STORE_SETTINGS, getPublicAssetUrl } from "@/lib/storefront";
import type {
  CatalogFilters,
  CatalogResult,
  StorefrontBanner,
  StorefrontCategory,
  StorefrontFaq,
  StorefrontProduct,
  StorefrontProductImage,
  StorefrontSettings,
  StorefrontTestimonial,
} from "@/types/storefront";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  short_description: string | null;
  description: string | null;
  price: number | string;
  compare_at_price: number | string | null;
  stock: number;
  reserved_stock: number;
  is_featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  cta_type: StorefrontProduct["cta_type"];
  cta_label: string;
  custom_url: string | null;
  whatsapp_number: string | null;
  whatsapp_template: string | null;
  open_in_new_tab: boolean;
  created_at: string;
  product_images: Array<{
    id: string;
    storage_path: string;
    alt_text: string | null;
    is_primary: boolean;
    sort_order: number;
  }> | null;
  product_categories: Array<{
    category_id: string;
    categories: StorefrontCategory | StorefrontCategory[] | null;
  }> | null;
};

const PRODUCT_SELECT =
  "id, name, slug, sku, short_description, description, price, compare_at_price, stock, reserved_stock, is_featured, seo_title, seo_description, cta_type, cta_label, custom_url, whatsapp_number, whatsapp_template, open_in_new_tab, created_at, product_images(id, storage_path, alt_text, is_primary, sort_order), product_categories(category_id, categories(id, name, slug, description, image_path, icon, sort_order))";

export class StorefrontRepositoryError extends Error {
  constructor(message = "Storefront belum dapat dimuat.") {
    super(message);
    this.name = "StorefrontRepositoryError";
  }
}

function sanitizeSearch(value = "") {
  return value.replace(/[%_,().]/g, " ").trim().slice(0, 80);
}

function mapProduct(row: ProductRow, supabaseUrl: string): StorefrontProduct {
  const images: StorefrontProductImage[] = (row.product_images ?? [])
    .map((image) => ({
      id: image.id,
      url: getPublicAssetUrl(supabaseUrl, "product-images", image.storage_path) ?? "",
      alt_text: image.alt_text,
      is_primary: image.is_primary,
      sort_order: image.sort_order,
    }))
    .filter((image) => Boolean(image.url))
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order);

  const categories = (row.product_categories ?? [])
    .flatMap((item) => (Array.isArray(item.categories) ? item.categories : item.categories ? [item.categories] : []))
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, "id"));

  return {
    ...row,
    price: Number(row.price),
    compare_at_price: row.compare_at_price === null ? null : Number(row.compare_at_price),
    available_stock: Math.max(0, row.stock - row.reserved_stock),
    images,
    categories,
  };
}

export const getStorefrontSettings = cache(async (): Promise<StorefrontSettings> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select(
      "id, store_name, tagline, description, logo_path, favicon_path, contact_email, contact_phone, whatsapp_number, address, business_hours, facebook_url, instagram_url, currency, flat_shipping_fee, seo_title, seo_description",
    )
    .limit(1)
    .maybeSingle();

  if (error) throw new StorefrontRepositoryError("Profil toko belum dapat dimuat.");
  const assetBaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (!data) return { ...DEFAULT_STORE_SETTINGS, asset_base_url: assetBaseUrl };

  return {
    ...data,
    flat_shipping_fee: Number(data.flat_shipping_fee),
    business_hours: (data.business_hours as Record<string, unknown> | null) ?? null,
    asset_base_url: assetBaseUrl,
  } as StorefrontSettings;
});

export const getStorefrontCategories = cache(async (): Promise<StorefrontCategory[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_path, icon, sort_order")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("sort_order")
    .order("name");

  if (error) throw new StorefrontRepositoryError("Kategori belum dapat dimuat.");
  return (data ?? []) as StorefrontCategory[];
});

export async function getStorefrontProducts(filters: CatalogFilters = {}): Promise<CatalogResult> {
  const supabase = await createClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(24, Math.max(1, filters.pageSize ?? 12));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" })
    .eq("status", "active")
    .neq("cta_type", "midtrans")
    .is("deleted_at", null);

  const search = sanitizeSearch(filters.search);
  if (search) {
    query = query.or(
      `name.ilike.%${search}%,sku.ilike.%${search}%,short_description.ilike.%${search}%`,
    );
  }
  if (filters.minPrice !== undefined) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("price", filters.maxPrice);
  if (filters.availability === "available") query = query.gt("stock", 0);

  if (filters.category) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.category)
      .eq("is_active", true)
      .maybeSingle();
    if (!category) return { products: [], total: 0, page, pageSize, totalPages: 1 };
    const { data: relations, error: relationError } = await supabase
      .from("product_categories")
      .select("product_id")
      .eq("category_id", category.id);
    if (relationError) throw new StorefrontRepositoryError("Filter kategori belum dapat diterapkan.");
    const productIds = (relations ?? []).map((item) => item.product_id);
    if (!productIds.length) return { products: [], total: 0, page, pageSize, totalPages: 1 };
    query = query.in("id", productIds);
  }

  switch (filters.sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "name":
      query = query.order("name", { ascending: true });
      break;
    case "popular":
      query = query.order("is_featured", { ascending: false }).order("sort_order");
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw new StorefrontRepositoryError("Daftar produk belum dapat dimuat.");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  let products = ((data ?? []) as unknown as ProductRow[]).map((row) => mapProduct(row, supabaseUrl));
  if (filters.availability === "available") {
    products = products.filter((product) => product.available_stock > 0);
  }

  const total = count ?? 0;
  return {
    products,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getFeaturedProducts(limit = 8) {
  const result = await getStorefrontProducts({ sort: "popular", pageSize: Math.min(limit, 24) });
  return result.products.filter((product) => product.is_featured).slice(0, limit);
}

export async function getNewestProducts(limit = 8) {
  const result = await getStorefrontProducts({ sort: "latest", pageSize: Math.min(limit, 24) });
  return result.products.slice(0, limit);
}

export const getStorefrontProductBySlug = cache(async (slug: string): Promise<StorefrontProduct | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("status", "active")
    .neq("cta_type", "midtrans")
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw new StorefrontRepositoryError("Detail produk belum dapat dimuat.");
  return data
    ? mapProduct(data as unknown as ProductRow, process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
    : null;
});

export async function getRelatedProducts(product: StorefrontProduct, limit = 4) {
  const category = product.categories[0]?.slug;
  const result = await getStorefrontProducts({ category, sort: "popular", pageSize: Math.min(limit + 1, 24) });
  return result.products.filter((item) => item.id !== product.id).slice(0, limit);
}

export const getStorefrontBanners = cache(async (): Promise<StorefrontBanner[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("banners")
    .select("id, title, subtitle, image_path, link_label, link_url, ends_at")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("sort_order")
    .limit(3);
  if (error) throw new StorefrontRepositoryError("Banner belum dapat dimuat.");
  return (data ?? []) as StorefrontBanner[];
});

export const getStorefrontTestimonials = cache(async (): Promise<StorefrontTestimonial[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, author_name, author_title, quote, image_path, rating")
    .eq("is_active", true)
    .not("consented_at", "is", null)
    .is("deleted_at", null)
    .order("sort_order")
    .limit(6);
  if (error) throw new StorefrontRepositoryError("Testimoni belum dapat dimuat.");
  return (data ?? []).map((item) => ({ ...item, rating: item.rating === null ? null : Number(item.rating) }));
});

export const getStorefrontFaqs = cache(async (): Promise<StorefrontFaq[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("faqs")
    .select("id, question, answer")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("sort_order");
  if (error) throw new StorefrontRepositoryError("FAQ belum dapat dimuat.");
  return (data ?? []) as StorefrontFaq[];
});

export async function getActiveProductSlugs() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("slug, updated_at")
    .eq("status", "active")
    .is("deleted_at", null);
  if (error) throw new StorefrontRepositoryError("Sitemap produk belum dapat dimuat.");
  return data ?? [];
}
