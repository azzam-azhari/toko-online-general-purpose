-- Data khusus development/local. Jangan gunakan kredensial ini di production.
-- Akun awal yang diminta: admin@gmail.com / admin123

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000010',
  'authenticated',
  'authenticated',
  'admin@gmail.com',
  extensions.crypt('admin123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Admin NusaMart"}'::jsonb,
  now(),
  now(),
  '',
  '',
  '',
  ''
)
on conflict (id) do update set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
values (
  '00000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000010',
  '{"sub":"00000000-0000-0000-0000-000000000010","email":"admin@gmail.com","email_verified":true}'::jsonb,
  'email',
  now(),
  now(),
  now()
)
on conflict (id) do update set
  identity_data = excluded.identity_data,
  updated_at = now();

update public.profiles
set full_name = 'Admin NusaMart', role = 'admin', is_active = true
where id = '00000000-0000-0000-0000-000000000010';

insert into public.store_settings (
  id,
  store_name,
  tagline,
  description,
  currency,
  timezone,
  flat_shipping_fee,
  low_stock_threshold
)
values (
  '00000000-0000-0000-0000-000000000001',
  'NusaMart',
  'Pilihan Tepat, Hidup Lebih Hebat',
  'Produk pilihan untuk membuat belanja kebutuhan harian dan gaya hidup terasa lebih praktis.',
  'IDR',
  'Asia/Jakarta',
  0,
  5
)
on conflict (id) do update set
  store_name = excluded.store_name,
  tagline = excluded.tagline,
  description = excluded.description,
  currency = excluded.currency,
  timezone = excluded.timezone,
  flat_shipping_fee = excluded.flat_shipping_fee,
  low_stock_threshold = excluded.low_stock_threshold;

insert into public.categories (id, name, slug, description, is_active, sort_order)
values
  (
    '00000000-0000-0000-0000-000000000101',
    'Kebutuhan Harian',
    'kebutuhan-harian',
    'Data demo development untuk kebutuhan rumah dan keseharian.',
    true,
    10
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    'Gaya Hidup',
    'gaya-hidup',
    'Data demo development untuk pelengkap gaya hidup.',
    true,
    20
  )
on conflict (id) do nothing;

insert into public.products (
  id,
  name,
  slug,
  sku,
  short_description,
  price,
  stock,
  status,
  cta_type,
  midtrans_enabled,
  created_by,
  updated_by
)
values (
  '00000000-0000-0000-0000-000000000201',
  'Produk Demo NusaMart',
  'produk-demo-nusamart',
  'DEMO-001',
  'Data demo development; ganti sebelum production.',
  100000,
  10,
  'draft',
  'midtrans',
  true,
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000010'
)
on conflict (id) do nothing;

insert into public.product_categories (product_id, category_id)
values (
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000101'
)
on conflict do nothing;
