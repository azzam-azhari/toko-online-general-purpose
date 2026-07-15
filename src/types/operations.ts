export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "completed",
  "cancelled",
] as const;

export const PAYMENT_STATUSES = ["unpaid", "pending", "paid", "failed", "expired", "refunded"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export type OrderItem = {
  id: string;
  product_id: string | null;
  product_name: string;
  product_sku: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type OrderStatusHistory = {
  id: string;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  note: string | null;
  created_at: string;
  actor_name: string | null;
};

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  customer_address: Record<string, unknown> | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string | null;
  currency: string;
  subtotal: number;
  discount_total: number;
  shipping_total: number;
  grand_total: number;
  notes: string | null;
  reconciliation_required: boolean;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  history: OrderStatusHistory[];
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  image_path: string | null;
  link_label: string | null;
  link_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  sort_order: number;
  updated_at: string;
};

export type Testimonial = {
  id: string;
  author_name: string;
  author_title: string | null;
  quote: string;
  image_path: string | null;
  rating: number | null;
  consented_at: string | null;
  is_active: boolean;
  sort_order: number;
  updated_at: string;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  is_active: boolean;
  sort_order: number;
  updated_at: string;
};

export type StoreSettings = {
  id: string;
  store_name: string;
  tagline: string | null;
  description: string | null;
  logo_path: string | null;
  favicon_path: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  whatsapp_number: string | null;
  address: string | null;
  business_hours: Record<string, string> | null;
  facebook_url: string | null;
  instagram_url: string | null;
  currency: string;
  timezone: string;
  flat_shipping_fee: number;
  low_stock_threshold: number;
  seo_title: string | null;
  seo_description: string | null;
  updated_at: string;
};

export type LowStockProduct = {
  id: string;
  name: string;
  sku: string;
  status: string;
  stock: number;
  reserved_stock: number;
  available_stock: number;
};

export type SalesPoint = {
  date: string;
  label: string;
  revenue: number;
  orders: number;
};
