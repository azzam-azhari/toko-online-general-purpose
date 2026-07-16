# NusaMart

Fondasi toko online general-purpose berbasis Next.js, Tailwind CSS, shadcn/ui, dan Supabase.

## Mulai

1. Gunakan Node.js versi yang tercantum di `.nvmrc`.
2. Salin `env.example` menjadi `.env.local`, lalu isi konfigurasi Supabase.
3. Jalankan `npm install`.
4. Jalankan `npm run dev`.

## Quality gate

Jalankan seluruh pemeriksaan lokal dengan:

```bash
npm run check
```

`npm run test:e2e` melakukan preflight environment dan database sebelum Playwright dimulai. Pastikan production build sudah tersedia dan Supabase yang dituju telah memiliki seluruh migrasi serta `supabase/seed.sql`. CI memakai Supabase lokal terisolasi, menjalankan migrasi dan seed dari awal, lalu menunggu `/api/health/ready` sebelum browser test berjalan.

Variabel wajib untuk server dan test lokal adalah `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, salah satu public key (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` atau `NEXT_PUBLIC_SUPABASE_ANON_KEY`), serta `SUPABASE_SERVICE_ROLE_KEY`. Konfigurasi Midtrans dan WhatsApp bersifat opsional pada fase storefront saat ini.

Dokumentasi produk dan teknis lengkap tersedia di folder `docs`.
