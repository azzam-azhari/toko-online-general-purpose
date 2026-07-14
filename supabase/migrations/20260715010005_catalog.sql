create table public.categories (
  id uuid primary key default extensions.gen_random_uuid(),
  parent_id uuid references public.categories (id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  image_path text,
  icon text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint categories_name_length check (char_length(trim(name)) between 1 and 120),
  constraint categories_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint categories_parent_not_self check (parent_id is null or parent_id <> id)
);

create table public.products (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sku text not null unique,
  short_description text,
  description text,
  price bigint not null default 0,
  compare_at_price bigint,
  stock integer not null default 0,
  reserved_stock integer not null default 0,
  status public.product_status not null default 'draft',
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  seo_title text,
  seo_description text,
  cta_type public.cta_type not null,
  cta_label text not null default 'Beli Sekarang',
  custom_url text,
  whatsapp_number text,
  whatsapp_template text,
  open_in_new_tab boolean not null default false,
  midtrans_enabled boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint products_name_length check (char_length(trim(name)) between 1 and 180),
  constraint products_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint products_sku_length check (char_length(trim(sku)) between 1 and 80),
  constraint products_price_nonnegative check (price >= 0),
  constraint products_compare_price check (compare_at_price is null or compare_at_price > price),
  constraint products_stock_valid check (
    stock >= 0 and reserved_stock >= 0 and reserved_stock <= stock
  ),
  constraint products_custom_url_https check (
    custom_url is null or custom_url ~* '^https://[^[:space:]]+$'
  ),
  constraint products_cta_configuration check (
    (cta_type = 'custom_url' and custom_url is not null and midtrans_enabled = false)
    or (cta_type = 'whatsapp' and midtrans_enabled = false)
    or (cta_type = 'midtrans' and midtrans_enabled = true)
  )
);

create table public.product_images (
  id uuid primary key default extensions.gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_images_path_length check (char_length(trim(storage_path)) between 1 and 1024)
);

create unique index product_images_one_primary_idx
on public.product_images (product_id)
where is_primary = true;

create table public.product_categories (
  product_id uuid not null references public.products (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, category_id)
);

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger product_images_set_updated_at
before update on public.product_images
for each row execute function public.set_updated_at();

