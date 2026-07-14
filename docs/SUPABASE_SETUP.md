# Setup Supabase

## 1. Membuat Project

1. Buat project Supabase terpisah untuk development, staging, dan production.
2. Simpan URL, anon key, dan service role key pada secret manager.
3. Atur region yang dekat dengan mayoritas pengguna.
4. Aktifkan email/password authentication.

## 2. Environment

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` hanya boleh diimpor pada module server-only.

## 3. Client

### Browser client

Digunakan untuk operasi client yang aman dan tunduk pada RLS.

### Server client

Digunakan pada Server Component, Server Action, dan Route Handler dengan session pengguna.

### Service client

Digunakan secara terbatas untuk:

- webhook payment,
- provisioning internal,
- maintenance job,
- operasi administratif terkontrol.

## 4. Database

Jalankan migration sesuai urutan. Setiap migration harus:

- deterministic,
- dapat diaudit,
- tidak bergantung pada state manual,
- aman untuk staging sebelum production.

## 5. Auth

- Nonaktifkan signup publik bila hanya akun internal.
- Gunakan invitation/admin creation untuk pengguna dashboard.
- Konfigurasikan redirect URL untuk reset password.
- Sesuaikan email template.

## 6. RLS

Aktifkan RLS pada tabel:

- profiles
- products
- product_images
- categories
- product_categories
- orders
- order_items
- payment_transactions
- banners
- testimonials
- faqs
- store_settings
- activity_logs

Jangan menganggap RLS sebagai pengganti validasi aplikasi.

## 7. Storage Bucket

Bucket yang disarankan:

- `product-images`
- `category-images`
- `store-assets`
- `avatars`

Gunakan path:

```text
product-images/{product_id}/{uuid}.{ext}
category-images/{category_id}/{uuid}.{ext}
store-assets/{asset_type}/{uuid}.{ext}
avatars/{user_id}/{uuid}.{ext}
```

## 8. Local Development

Gunakan Supabase CLI bila tersedia:

```bash
supabase start
supabase db reset
supabase migration new add_products
supabase db diff
```

## 9. Seed

Seed development minimal:

- satu atau beberapa akun admin,
- beberapa kategori,
- beberapa produk,
- banner,
- FAQ,
- pengaturan toko.

Jangan memasukkan password production ke seed.
