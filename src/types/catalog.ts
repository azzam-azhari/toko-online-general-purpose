export const PRODUCT_STATUSES = ["draft", "active", "inactive", "archived"] as const;
export const CTA_TYPES = ["custom_url", "whatsapp", "midtrans"] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];
export type CtaType = (typeof CTA_TYPES)[number];

export type ProductImage = {
  id: string;
  storage_path: string;
  public_url: string | null;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  url: string;
};

export type Category = {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image_path: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  short_description: string | null;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  reserved_stock: number;
  status: ProductStatus;
  is_featured: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  cta_type: CtaType;
  cta_label: string;
  custom_url: string | null;
  whatsapp_number: string | null;
  whatsapp_template: string | null;
  open_in_new_tab: boolean;
  created_at: string;
  updated_at: string;
  product_images: ProductImage[];
  category_ids: string[];
};

export type ActivityLog = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  created_at: string;
  actor_name: string | null;
};

export type DashboardOverview = {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  inactiveProducts: number;
  totalCategories: number;
  lowStockProducts: number;
  storeProfileComplete: boolean;
  recentActivity: ActivityLog[];
};
