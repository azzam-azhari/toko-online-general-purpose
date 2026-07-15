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

insert into public.categories (
  id, name, slug, description, icon, is_active, sort_order, created_by, updated_by
)
values
  (
    '00000000-0000-0000-0000-000000000101',
    'Kebutuhan Harian',
    'kebutuhan-harian',
    'Perlengkapan praktis untuk kebutuhan rumah dan aktivitas sehari-hari.',
    'shopping-basket',
    true,
    10,
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000010'
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    'Gaya Hidup',
    'gaya-hidup',
    'Produk pilihan untuk mendukung rutinitas dan gaya hidup modern.',
    'sparkles',
    true,
    20,
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000010'
  ),
  (
    '00000000-0000-0000-0000-000000000103',
    'Elektronik & Aksesori',
    'elektronik-aksesori',
    'Perangkat elektronik ringan dan aksesori untuk kebutuhan harian.',
    'cable',
    true,
    30,
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000010'
  )
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  icon = excluded.icon,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  updated_by = excluded.updated_by,
  deleted_at = null;

insert into public.products (
  id,
  name,
  slug,
  sku,
  short_description,
  description,
  price,
  compare_at_price,
  stock,
  status,
  cta_type,
  cta_label,
  custom_url,
  whatsapp_template,
  midtrans_enabled,
  created_by,
  updated_by
)
values
  (
    '00000000-0000-0000-0000-000000000201',
    'Botol Minum Tritan 1L',
    'botol-minum-tritan-1l',
    'KH-BTL-001',
    'Botol minum ringan, tahan benturan, dan nyaman dibawa setiap hari.',
    'Botol berbahan Tritan bebas BPA dengan kapasitas 1 liter, tutup anti-bocor, dan tali pembawa.',
    89000,
    109000,
    30,
    'active',
    'whatsapp',
    'Pesan via WhatsApp',
    null,
    'Halo, saya tertarik dengan {product_name} seharga {product_price}.',
    false,
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000010'
  ),
  (
    '00000000-0000-0000-0000-000000000202',
    'Kotak Makan Stainless',
    'kotak-makan-stainless',
    'KH-KMK-002',
    'Kotak makan dua sekat dengan bagian dalam stainless yang mudah dibersihkan.',
    'Cocok untuk bekal sekolah maupun kantor, dilengkapi pengunci rapat dan dua kompartemen.',
    129000,
    159000,
    18,
    'active',
    'custom_url',
    'Beli Sekarang',
    'https://example.com/products/kotak-makan-stainless',
    null,
    false,
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000010'
  ),
  (
    '00000000-0000-0000-0000-000000000203',
    'Set Handuk Katun Premium',
    'set-handuk-katun-premium',
    'KH-HDK-003',
    'Set handuk katun lembut dengan daya serap tinggi untuk seluruh keluarga.',
    'Berisi satu handuk mandi dan satu handuk wajah berbahan katun premium yang lembut di kulit.',
    149000,
    199000,
    12,
    'active',
    'midtrans',
    'Beli Sekarang',
    null,
    null,
    true,
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000010'
  ),
  (
    '00000000-0000-0000-0000-000000000204',
    'Tote Bag Kanvas Nusa',
    'tote-bag-kanvas-nusa',
    'GH-TBG-001',
    'Tas kanvas serbaguna dengan desain minimalis untuk aktivitas santai.',
    'Menggunakan kanvas tebal dengan kompartemen utama luas dan saku kecil di bagian dalam.',
    79000,
    99000,
    24,
    'active',
    'whatsapp',
    'Pesan via WhatsApp',
    null,
    'Halo, saya ingin memesan {product_name}. Apakah stoknya masih tersedia?',
    false,
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000010'
  ),
  (
    '00000000-0000-0000-0000-000000000205',
    'Diffuser Aroma Kayu',
    'diffuser-aroma-kayu',
    'GH-DFS-002',
    'Diffuser berdesain kayu yang membantu menciptakan suasana ruangan lebih nyaman.',
    'Memiliki beberapa pilihan durasi semprot dan pencahayaan lembut untuk meja kerja atau kamar.',
    169000,
    199000,
    15,
    'active',
    'custom_url',
    'Lihat Penawaran',
    'https://example.com/products/diffuser-aroma-kayu',
    null,
    false,
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000010'
  ),
  (
    '00000000-0000-0000-0000-000000000206',
    'Tumbler Kopi Insulasi',
    'tumbler-kopi-insulasi',
    'GH-TMB-003',
    'Tumbler insulasi untuk menjaga suhu minuman selama perjalanan.',
    'Dinding ganda stainless steel, tutup rapat, dan bentuk ramping yang muat di cup holder kendaraan.',
    189000,
    229000,
    20,
    'active',
    'midtrans',
    'Beli Sekarang',
    null,
    null,
    true,
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000010'
  ),
  (
    '00000000-0000-0000-0000-000000000207',
    'Lampu Meja LED Portable',
    'lampu-meja-led-portable',
    'EL-LMP-001',
    'Lampu meja isi ulang dengan tiga tingkat kecerahan.',
    'Leher lampu fleksibel, kontrol sentuh, dan baterai isi ulang untuk belajar atau bekerja.',
    219000,
    259000,
    14,
    'active',
    'midtrans',
    'Beli Sekarang',
    null,
    null,
    true,
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000010'
  ),
  (
    '00000000-0000-0000-0000-000000000208',
    'Kabel Data USB-C 100W',
    'kabel-data-usb-c-100w',
    'EL-KBL-002',
    'Kabel USB-C berlapis nilon untuk pengisian daya cepat hingga 100W.',
    'Panjang 1,5 meter dengan konektor kokoh untuk laptop, tablet, dan ponsel yang kompatibel.',
    99000,
    129000,
    40,
    'active',
    'custom_url',
    'Beli Sekarang',
    'https://example.com/products/kabel-data-usb-c-100w',
    null,
    false,
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000010'
  ),
  (
    '00000000-0000-0000-0000-000000000209',
    'Earphone Bluetooth Mini',
    'earphone-bluetooth-mini',
    'EL-EAR-003',
    'Earphone nirkabel ringkas dengan charging case yang mudah dibawa.',
    'Mendukung kontrol sentuh, mikrofon internal, dan penggunaan hingga beberapa jam per pengisian.',
    299000,
    349000,
    11,
    'active',
    'whatsapp',
    'Tanya Stok',
    null,
    'Halo, apakah {product_name} masih tersedia?',
    false,
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000010'
  )
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  sku = excluded.sku,
  short_description = excluded.short_description,
  description = excluded.description,
  price = excluded.price,
  compare_at_price = excluded.compare_at_price,
  stock = excluded.stock,
  status = excluded.status,
  cta_type = excluded.cta_type,
  cta_label = excluded.cta_label,
  custom_url = excluded.custom_url,
  whatsapp_template = excluded.whatsapp_template,
  midtrans_enabled = excluded.midtrans_enabled,
  updated_by = excluded.updated_by,
  deleted_at = null;

insert into public.product_categories (product_id, category_id)
values
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-000000000207', '00000000-0000-0000-0000-000000000103'),
  ('00000000-0000-0000-0000-000000000208', '00000000-0000-0000-0000-000000000103'),
  ('00000000-0000-0000-0000-000000000209', '00000000-0000-0000-0000-000000000103')
on conflict do nothing;
