# Environment Variables

## 1. Contoh `env.example`

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=General Store

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
MIDTRANS_SERVER_KEY=
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_NOTIFICATION_URL=

NEXT_PUBLIC_DEFAULT_WHATSAPP_NUMBER=

LOG_LEVEL=info
ORDER_NUMBER_PREFIX=ORD
LOW_STOCK_THRESHOLD=5
```

## 2. Klasifikasi

### Boleh di Client

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`
- `NEXT_PUBLIC_DEFAULT_WHATSAPP_NUMBER`

Walau anon/client key boleh di client, akses tetap harus dilindungi oleh RLS dan konfigurasi provider.

`NEXT_PUBLIC_APP_NAME` hanya menjadi fallback awal. Setelah `store_settings` tersedia, nama toko yang diedit admin melalui dashboard menjadi sumber utama untuk tampilan publik dan metadata.

### Server Only

- `SUPABASE_SERVICE_ROLE_KEY`
- `MIDTRANS_SERVER_KEY`
- internal webhook secret tambahan,
- private logging token.

## 3. Validasi Env

Gunakan Zod dan pisahkan schema server/client.

Aplikasi harus gagal saat startup bila env wajib tidak valid.

## 4. Environment

Gunakan nilai berbeda untuk:

- `.env.local`
- staging secret
- production secret

Jangan commit `.env.local`.

## 5. Rotasi

Rotasi segera bila:

- key masuk repository,
- key tercetak di log,
- akses anggota tim dicabut,
- ada aktivitas mencurigakan.
