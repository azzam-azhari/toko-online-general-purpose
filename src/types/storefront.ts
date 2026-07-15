import type { CtaType } from "@/types/catalog";

export type StorefrontSettings = {
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
  business_hours: Record<string, unknown> | null;
  facebook_url: string | null;
  instagram_url: string | null;
  currency: string;
  flat_shipping_fee: number;
  seo_title: string | null;
  seo_description: string | null;
  asset_base_url: string;
};

export type StorefrontCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_path: string | null;
  icon: string | null;
  sort_order: number;
};

export type StorefrontProductImage = {
  id: string;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
};

export type StorefrontProduct = {
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
  available_stock: number;
  is_featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  cta_type: CtaType;
  cta_label: string;
  custom_url: string | null;
  whatsapp_number: string | null;
  whatsapp_template: string | null;
  open_in_new_tab: boolean;
  created_at: string;
  images: StorefrontProductImage[];
  categories: StorefrontCategory[];
};

export type StorefrontBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  image_path: string | null;
  link_label: string | null;
  link_url: string | null;
  ends_at: string | null;
};

export type StorefrontTestimonial = {
  id: string;
  author_name: string;
  author_title: string | null;
  quote: string;
  image_path: string | null;
  rating: number | null;
};

export type StorefrontFaq = {
  id: string;
  question: string;
  answer: string;
};

export type CatalogSort = "latest" | "price-asc" | "price-desc" | "name" | "popular";

export type CatalogFilters = {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: "available" | "all";
  sort?: CatalogSort;
  page?: number;
  pageSize?: number;
};

export type CatalogResult = {
  products: StorefrontProduct[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
