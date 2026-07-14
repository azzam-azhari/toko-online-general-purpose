create table public.banners (
  id uuid primary key default extensions.gen_random_uuid(),
  title text not null,
  subtitle text,
  image_path text,
  link_label text,
  link_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint banners_title_length check (char_length(trim(title)) between 1 and 180),
  constraint banners_link_url_https check (link_url is null or link_url ~* '^https://[^[:space:]]+$'),
  constraint banners_schedule_valid check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table public.testimonials (
  id uuid primary key default extensions.gen_random_uuid(),
  author_name text not null,
  author_title text,
  quote text not null,
  image_path text,
  rating smallint,
  consented_at timestamptz,
  is_active boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint testimonials_rating_valid check (rating is null or rating between 1 and 5),
  constraint testimonials_publishing_requires_consent check (is_active = false or consented_at is not null)
);

create table public.faqs (
  id uuid primary key default extensions.gen_random_uuid(),
  question text not null,
  answer text not null,
  is_active boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint faqs_question_length check (char_length(trim(question)) between 1 and 300),
  constraint faqs_answer_not_blank check (char_length(trim(answer)) > 0)
);

create table public.store_settings (
  id uuid primary key default extensions.gen_random_uuid(),
  store_name text not null,
  tagline text,
  description text,
  logo_path text,
  favicon_path text,
  contact_email text,
  contact_phone text,
  whatsapp_number text,
  address text,
  business_hours jsonb,
  facebook_url text,
  instagram_url text,
  currency text not null default 'IDR',
  timezone text not null default 'Asia/Jakarta',
  flat_shipping_fee bigint not null default 0,
  low_stock_threshold integer not null default 5,
  seo_title text,
  seo_description text,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint store_settings_singleton check (id = '00000000-0000-0000-0000-000000000001'::uuid),
  constraint store_settings_name_length check (char_length(trim(store_name)) between 1 and 120),
  constraint store_settings_currency_format check (currency ~ '^[A-Z]{3}$'),
  constraint store_settings_shipping_nonnegative check (flat_shipping_fee >= 0),
  constraint store_settings_threshold_nonnegative check (low_stock_threshold >= 0),
  constraint store_settings_facebook_https check (facebook_url is null or facebook_url ~* '^https://[^[:space:]]+$'),
  constraint store_settings_instagram_https check (instagram_url is null or instagram_url ~* '^https://[^[:space:]]+$')
);

create trigger banners_set_updated_at
before update on public.banners
for each row execute function public.set_updated_at();

create trigger testimonials_set_updated_at
before update on public.testimonials
for each row execute function public.set_updated_at();

create trigger faqs_set_updated_at
before update on public.faqs
for each row execute function public.set_updated_at();

create trigger store_settings_set_updated_at
before update on public.store_settings
for each row execute function public.set_updated_at();

