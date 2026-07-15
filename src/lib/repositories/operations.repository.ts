import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  Banner,
  ExternalOrderProduct,
  Faq,
  LowStockProduct,
  Order,
  OrderStatus,
  PaymentStatus,
  SalesPoint,
  StoreSettings,
  Testimonial,
} from "@/types/operations";

export class OperationsRepositoryError extends Error {
  constructor(message = "Data operasional belum dapat dimuat.") {
    super(message);
    this.name = "OperationsRepositoryError";
  }
}

const FALLBACK_STORE_SETTINGS: StoreSettings = {
  id: "00000000-0000-0000-0000-000000000001",
  store_name: "NusaMart",
  tagline: "Pilihan Tepat, Hidup Lebih Hebat",
  description: "Produk pilihan untuk membuat belanja kebutuhan harian dan gaya hidup terasa lebih praktis.",
  logo_path: null,
  favicon_path: null,
  contact_email: null,
  contact_phone: null,
  whatsapp_number: null,
  address: null,
  business_hours: null,
  facebook_url: null,
  instagram_url: null,
  currency: "IDR",
  timezone: "Asia/Jakarta",
  flat_shipping_fee: 0,
  low_stock_threshold: 5,
  seo_title: null,
  seo_description: null,
  updated_at: new Date(0).toISOString(),
};

function mapStoreSettings(data: Record<string, unknown>): StoreSettings {
  return {
    ...FALLBACK_STORE_SETTINGS,
    ...data,
    flat_shipping_fee: Number(data.flat_shipping_fee ?? FALLBACK_STORE_SETTINGS.flat_shipping_fee),
    low_stock_threshold: Number(data.low_stock_threshold ?? FALLBACK_STORE_SETTINGS.low_stock_threshold),
    business_hours: (data.business_hours as Record<string, string> | null) ?? null,
  } as StoreSettings;
}

function sanitizeSearch(value = "") {
  return value.replace(/[%_,().]/g, " ").trim().slice(0, 80);
}

type OrderRow = Omit<Order, "subtotal" | "discount_total" | "shipping_total" | "grand_total" | "items" | "history" | "payments"> & {
  subtotal: number | string;
  discount_total: number | string;
  shipping_total: number | string;
  grand_total: number | string;
  order_items?: Array<{
    id: string;
    product_id: string | null;
    product_name: string;
    product_sku: string | null;
    unit_price: number | string;
    quantity: number;
    line_total: number | string;
  }> | null;
  order_status_history?: Array<{
    id: string;
    from_status: OrderStatus | null;
    to_status: OrderStatus;
    note: string | null;
    created_at: string;
    actor: { full_name: string | null } | Array<{ full_name: string | null }> | null;
  }> | null;
  payment_transactions?: Array<{
    id: string;
    provider: "whatsapp" | "custom_url";
    provider_order_id: string;
    transaction_id: string | null;
    transaction_status: string | null;
    gross_amount: number | string;
    currency: string;
    paid_at: string | null;
    expired_at: string | null;
    created_at: string;
    updated_at: string;
  }> | null;
};

function mapOrder(row: OrderRow): Order {
  return {
    ...row,
    subtotal: Number(row.subtotal),
    discount_total: Number(row.discount_total),
    shipping_total: Number(row.shipping_total),
    grand_total: Number(row.grand_total),
    items: (row.order_items ?? []).map((item) => ({
      ...item,
      unit_price: Number(item.unit_price),
      line_total: Number(item.line_total),
    })),
    history: (row.order_status_history ?? []).map((entry) => {
      const actor = Array.isArray(entry.actor) ? entry.actor[0] : entry.actor;
      return { ...entry, actor_name: actor?.full_name ?? null };
    }),
    payments: (row.payment_transactions ?? []).map((payment) => ({
      ...payment,
      gross_amount: Number(payment.gross_amount),
    })),
  };
}

export async function getOrders(options: {
  search?: string;
  status?: OrderStatus | "all";
  payment?: PaymentStatus | "all";
  page?: number;
  pageSize?: number;
} = {}) {
  const supabase = await createClient();
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, options.pageSize ?? 20));
  const from = (page - 1) * pageSize;
  let query = supabase
    .from("orders")
    .select("id, order_number, customer_name, customer_email, customer_phone, customer_address, status, payment_status, payment_method, sales_channel, source_reference, currency, subtotal, discount_total, shipping_total, grand_total, notes, reconciliation_required, created_at, updated_at", { count: "exact" })
    .is("deleted_at", null);

  const search = sanitizeSearch(options.search);
  if (search) query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`);
  if (options.status && options.status !== "all") query = query.eq("status", options.status);
  if (options.payment && options.payment !== "all") query = query.eq("payment_status", options.payment);

  const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, from + pageSize - 1);
  if (error) throw new OperationsRepositoryError("Daftar pesanan belum dapat dimuat.");
  return { orders: ((data ?? []) as OrderRow[]).map(mapOrder), total: count ?? 0, page, pageSize };
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, customer_email, customer_phone, customer_address, status, payment_status, payment_method, sales_channel, source_reference, currency, subtotal, discount_total, shipping_total, grand_total, notes, reconciliation_required, created_at, updated_at, order_items(id, product_id, product_name, product_sku, unit_price, quantity, line_total), order_status_history(id, from_status, to_status, note, created_at, actor:profiles!order_status_history_actor_id_fkey(full_name)), payment_transactions(id, provider, provider_order_id, transaction_id, transaction_status, gross_amount, currency, paid_at, expired_at, created_at, updated_at)")
    .eq("id", id)
    .is("deleted_at", null)
    .order("created_at", { referencedTable: "order_status_history", ascending: true })
    .maybeSingle();
  if (error) throw new OperationsRepositoryError("Detail pesanan belum dapat dimuat.");
  return data ? mapOrder(data as unknown as OrderRow) : null;
}

export async function getExternalOrderProducts(): Promise<ExternalOrderProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, sku, price, stock, reserved_stock, cta_type")
    .eq("status", "active")
    .is("deleted_at", null)
    .in("cta_type", ["whatsapp", "custom_url"])
    .order("name");
  if (error) throw new OperationsRepositoryError("Produk untuk pesanan belum dapat dimuat.");
  return (data ?? []).map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    price: Number(product.price),
    available_stock: Number(product.stock) - Number(product.reserved_stock),
    sales_channel: product.cta_type as "whatsapp" | "custom_url",
  }));
}

export async function getContentManagementData() {
  const supabase = await createClient();
  const [banners, testimonials, faqs] = await Promise.all([
    supabase.from("banners").select("id, title, subtitle, image_path, link_label, link_url, starts_at, ends_at, is_active, sort_order, updated_at").is("deleted_at", null).order("sort_order").order("updated_at", { ascending: false }),
    supabase.from("testimonials").select("id, author_name, author_title, quote, image_path, rating, consented_at, is_active, sort_order, updated_at").is("deleted_at", null).order("sort_order").order("updated_at", { ascending: false }),
    supabase.from("faqs").select("id, question, answer, is_active, sort_order, updated_at").is("deleted_at", null).order("sort_order").order("updated_at", { ascending: false }),
  ]);
  if (banners.error || testimonials.error || faqs.error) throw new OperationsRepositoryError("Konten website belum dapat dimuat.");
  return {
    banners: (banners.data ?? []) as Banner[],
    testimonials: (testimonials.data ?? []).map((item) => ({ ...item, rating: item.rating === null ? null : Number(item.rating) })) as Testimonial[],
    faqs: (faqs.data ?? []) as Faq[],
  };
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select("id, store_name, tagline, description, logo_path, favicon_path, contact_email, contact_phone, whatsapp_number, address, business_hours, facebook_url, instagram_url, currency, timezone, flat_shipping_fee, low_stock_threshold, seo_title, seo_description, updated_at")
    .limit(1)
    .maybeSingle();

  if (!error) return data ? mapStoreSettings(data) : FALLBACK_STORE_SETTINGS;

  // Compatibility path for databases that have not received the favicon column yet.
  const { data: legacyData, error: legacyError } = await supabase
    .from("store_settings")
    .select("id, store_name, tagline, description, logo_path, contact_email, contact_phone, whatsapp_number, address, business_hours, facebook_url, instagram_url, currency, timezone, flat_shipping_fee, low_stock_threshold, seo_title, seo_description, updated_at")
    .limit(1)
    .maybeSingle();

  if (!legacyError) return legacyData ? mapStoreSettings({ ...legacyData, favicon_path: null }) : FALLBACK_STORE_SETTINGS;

  console.warn("[operations] Store settings unavailable; using safe defaults.", {
    code: legacyError.code ?? error.code,
  });
  return FALLBACK_STORE_SETTINGS;
}

export async function getLowStockReport(): Promise<{ threshold: number; products: LowStockProduct[] }> {
  const supabase = await createClient();
  const [settings, products] = await Promise.all([
    supabase.from("store_settings").select("low_stock_threshold").limit(1).maybeSingle(),
    supabase.from("products").select("id, name, sku, status, stock, reserved_stock").is("deleted_at", null).neq("status", "archived").order("stock"),
  ]);
  if (products.error) throw new OperationsRepositoryError("Laporan stok rendah belum dapat dimuat.");
  const threshold = settings.error || !settings.data ? FALLBACK_STORE_SETTINGS.low_stock_threshold : Number(settings.data.low_stock_threshold);
  return {
    threshold,
    products: (products.data ?? [])
      .map((product) => ({ ...product, available_stock: product.stock - product.reserved_stock }))
      .filter((product) => product.available_stock <= threshold),
  };
}

function jakartaDateKey(value: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(value);
}

export async function getSalesOverview(days = 14): Promise<{ totalOrders: number; paidRevenue: number; chart: SalesPoint[] }> {
  const supabase = await createClient();
  const safeDays = Math.min(90, Math.max(7, days));
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - (safeDays - 1));
  since.setUTCHours(0, 0, 0, 0);
  const { data, error } = await supabase
    .from("orders")
    .select("created_at, grand_total, payment_status")
    .is("deleted_at", null)
    .gte("created_at", since.toISOString())
    .order("created_at");
  if (error) throw new OperationsRepositoryError("Grafik penjualan belum dapat dimuat.");

  const byDate = new Map<string, { revenue: number; orders: number }>();
  for (let offset = 0; offset < safeDays; offset += 1) {
    const date = new Date(since);
    date.setUTCDate(since.getUTCDate() + offset);
    byDate.set(jakartaDateKey(date), { revenue: 0, orders: 0 });
  }
  for (const order of data ?? []) {
    const point = byDate.get(jakartaDateKey(new Date(order.created_at)));
    if (!point) continue;
    point.orders += 1;
    if (order.payment_status === "paid") point.revenue += Number(order.grand_total);
  }
  const chart = Array.from(byDate, ([date, value]) => ({
    date,
    label: new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: "Asia/Jakarta" }).format(new Date(`${date}T12:00:00+07:00`)),
    ...value,
  }));
  return {
    totalOrders: chart.reduce((total, item) => total + item.orders, 0),
    paidRevenue: chart.reduce((total, item) => total + item.revenue, 0),
    chart,
  };
}
