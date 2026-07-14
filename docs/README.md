# Dokumentasi Toko Online General-Purpose

Dokumentasi ini menjadi sumber acuan utama untuk perencanaan, implementasi, pengujian, keamanan, dan deployment aplikasi toko online general-purpose.

## Ringkasan

Aplikasi dirancang untuk menjual berbagai jenis produk tanpa terikat pada kategori tertentu. Pengunjung dapat menjelajah produk, mencari dan memfilter katalog, memasukkan produk ke keranjang, lalu menyelesaikan pembelian melalui salah satu dari tiga jalur:

1. Tautan eksternal yang dapat dikonfigurasi.
2. WhatsApp dengan pesan dinamis.
3. Pembayaran Midtrans.

Dashboard internal hanya digunakan oleh satu role, yaitu `admin`. Admin mengelola produk, pesanan, konten halaman publik, serta profil toko seperti nama toko, logo, kontak, dan tautan media sosial.

## Prinsip Utama

- Mudah digunakan pada perangkat mobile, tablet, dan desktop.
- UI publik dan dashboard harus sederhana, memakai istilah yang mudah dipahami, dan menonjolkan tindakan utama.
- Mendorong konversi melalui navigasi, informasi produk, dan call-to-action yang jelas.
- Aman, type-safe, modular, dan mudah dipelihara.
- Server Components digunakan secara default.
- Mutasi data dilakukan melalui Server Actions atau Route Handlers.
- Semua input divalidasi menggunakan Zod.
- Pemeriksaan otorisasi dilakukan di server dan diperkuat dengan Supabase RLS.

## Tech Stack

| Area | Teknologi |
|---|---|
| Framework | Next.js 16.2.7 |
| UI Runtime | React 19.2.4, React DOM 19.2.4 |
| Bahasa | TypeScript 5.9.3 |
| Styling | Tailwind CSS 4.2.1 |
| UI | shadcn/ui, Radix UI, Lucide React, Hugeicons React |
| Data | Supabase SSR, Supabase JS |
| Server state | TanStack Query |
| Table | TanStack Table |
| Client state | Zustand |
| Form | React Hook Form, Zod |
| Grafik | Recharts |
| Toast | Sonner |
| Tema | next-themes, @teispace/next-themes |
| Peta | MapLibre GL |
| Payment | Midtrans |
| Pesan pembelian | WhatsApp deep link |

Versi aktual tetap harus diverifikasi melalui `package.json` dan lockfile.

## Daftar Dokumen

| Dokumen | Tujuan |
|---|---|
| `PRODUCT_REQUIREMENTS.md` | Kebutuhan produk, persona, tujuan, dan acceptance criteria |
| `FEATURES.md` | Daftar fitur publik dan dashboard |
| `ARCHITECTURE.md` | Arsitektur sistem dan aliran data |
| `PROJECT_STRUCTURE.md` | Struktur folder, route, dan konvensi penempatan kode |
| `DATABASE_SCHEMA.md` | Skema database, relasi, index, trigger, dan RLS |
| `AUTHORIZATION.md` | Role, permission, proteksi route, dan kebijakan akses |
| `SUPABASE_SETUP.md` | Persiapan project Supabase |
| `STORAGE.md` | Strategi upload dan pengelolaan file |
| `API_AND_SERVER_ACTIONS.md` | Kontrak Route Handler dan Server Action |
| `MIDTRANS_INTEGRATION.md` | Alur pembayaran dan webhook Midtrans |
| `WHATSAPP_INTEGRATION.md` | Pembuatan tautan dan pesan WhatsApp |
| `UI_UX_GUIDELINES.md` | Panduan antarmuka, responsivitas, dan aksesibilitas |
| `SEO.md` | Metadata, sitemap, robots, dan structured data |
| `SECURITY.md` | Threat model dan kontrol keamanan |
| `ENVIRONMENT_VARIABLES.md` | Daftar env dan aturan pengelolaan secret |
| `DEVELOPMENT_GUIDE.md` | Workflow pengembangan |
| `TESTING_STRATEGY.md` | Strategi unit, integration, E2E, dan security test |
| `DEPLOYMENT.md` | Deployment aplikasi, database, webhook, dan rollback |
| `ROADMAP.md` | Tahapan implementasi |

## Urutan Implementasi

1. Validasi kebutuhan dan scope.
2. Siapkan repository, environment, dan Supabase.
3. Terapkan database schema, trigger, dan RLS.
4. Implementasikan autentikasi dan otorisasi khusus admin.
5. Buat layout publik dan dashboard.
6. Implementasikan CRUD produk, kategori, serta storage.
7. Implementasikan katalog, detail produk, pencarian, dan keranjang.
8. Implementasikan checkout custom URL, WhatsApp, dan Midtrans.
9. Implementasikan pesanan, status pembayaran, serta webhook.
10. Tambahkan observability, pengujian, SEO, dan hardening keamanan.
11. Deploy ke staging, lakukan UAT, lalu release ke production.

## Definition of Done

Sebuah fitur dianggap selesai apabila:

- TypeScript dan lint lolos tanpa error.
- Validasi server tersedia.
- Permission dan RLS diuji.
- Loading, empty, success, dan error state tersedia.
- Tampilan mobile dan desktop telah diperiksa.
- Test yang relevan tersedia.
- Dokumentasi diperbarui.
- Tidak ada secret yang terkirim ke client atau repository.
