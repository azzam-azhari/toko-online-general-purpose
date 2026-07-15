# Fase 7 — Quality

Dokumen ini menyimpan quality gate yang dapat diulang dan bukti UAT untuk Fase 7. Checklist hanya boleh dicentang setelah perintah terkait benar-benar berhasil pada environment yang disebutkan.

## Quality gate otomatis

Jalankan:

```bash
npm run check
npm audit
```

`npm run check` mencakup TypeScript, lint, unit/integration test dengan coverage, production build, E2E, audit aksesibilitas WCAG A/AA otomatis, pemeriksaan header keamanan, dan performance budget frontend.

Target minimum:

- Semua test lulus.
- Coverage file aturan bisnis yang dipilih: branches 75%, functions/lines/statements 80%.
- Tidak ada vulnerability high atau critical; vulnerability lain wajib ditinjau dan dicatat.
- Halaman publik utama tidak memiliki pelanggaran Axe WCAG A/AA otomatis.
- JavaScript beranda < 1,2 MB, CSS < 250 KB, dan TTFB lokal < 5 detik.
- Dashboard tanpa session diarahkan ke login.
- CSP, anti-framing, anti-MIME-sniffing, dan referrer policy tersedia pada response.

## Audit manual aksesibilitas

- [ ] Navigasi keyboard dari skip link, header, CTA, form, dialog, hingga footer telah diuji.
- [ ] Focus indicator terlihat pada desktop dan mobile viewport.
- [ ] Zoom 200% tidak menghilangkan konten atau tindakan utama.
- [ ] Pembaca layar memaknai heading, label form, status, dan dialog dengan benar.
- [ ] Kontras dark/light mode diperiksa pada halaman publik dan dashboard.

Audit Axe membantu mendeteksi masalah otomatis, tetapi tidak menggantikan lima pemeriksaan manual di atas.

## UAT staging

Gunakan Supabase, key, data, dan URL khusus staging—bukan development atau production.

| Journey | Hasil | Catatan |
|---|---|---|
| Landing, katalog, pencarian, filter, detail | Belum diuji | Memerlukan URL staging |
| CTA WhatsApp dan custom URL | Belum diuji | Verifikasi protocol, target, dan fallback |
| Login/logout/reset password admin | Belum diuji | Gunakan akun admin staging |
| CRUD produk/kategori, hapus permanen, dan upload gambar | Belum diuji | Verifikasi dialog irreversible, hard delete, activity log, cascade relasi, snapshot order, dan cleanup Storage |
| Operasional order/konten/profil toko | Belum diuji | Verifikasi revalidation storefront |
| Akun nonaktif/unauthorized ditolak | Belum diuji | Verifikasi UI, server action, dan RLS |
| Smoke test mobile/tablet/desktop | Belum diuji | Chrome/Chromium dan satu browser kedua |

Data bukti yang wajib dicatat setelah UAT:

- URL dan deployment ID staging.
- Commit SHA.
- Tanggal, tester, browser/device.
- Hasil setiap journey dan tautan issue untuk temuan.
- Persetujuan pemilik produk sebelum checklist `UAT staging` dicentang.

## Hardening yang diterapkan

- Security headers global dan CSP berbasis allowlist.
- Rate limit tambahan untuk login dan reset password; rate limit Supabase tetap aktif sebagai lapisan utama lintas instance.
- Signup publik dimatikan, password change membutuhkan reauthentication, dan frekuensi email/reset diperlambat.
- User Auth baru tidak otomatis aktif sebagai admin kecuali dibuat melalui alur admin tepercaya dengan `app_metadata.role=admin`.
- RLS `store_settings` memisahkan kolom publik untuk anon dari akses full-row admin aktif.
- Upload SVG dinonaktifkan pada bucket aset toko karena alur UI tidak membutuhkannya.
- Endpoint health memakai `no-store` dan hanya mengembalikan kontrak minimum.
- Dependency audit menjadi bagian release gate.
- Penghapusan produk/kategori memakai RPC transaksional yang hanya dapat dijalankan admin aktif, menyimpan snapshot audit, dan membersihkan folder gambar melalui service role server-only dengan validasi path serta retry.

## Hasil verifikasi lokal — 15 Juli 2026

- [x] `npm run check`: lulus.
- [x] TypeScript dan ESLint: lulus.
- [x] Unit/integration: 63 test lulus, termasuk dialog penghapusan permanen, penolakan status arsip, migrasi hard-delete, dan validasi path Storage.
- [x] Coverage: 88,48% statements, 77,85% branches, 95,83% functions, 92,43% lines.
- [x] Production build: 31 route berhasil dihasilkan.
- [x] E2E, accessibility, security header, dan performance budget: 28 test desktop/mobile lulus; setelah penambahan verifikasi keyboard, suite menjadi 30 test.
- [x] `npm audit --audit-level=moderate`: 0 vulnerability.
- [x] Pemeriksaan visual beranda produksi lokal: layout stabil dan tidak ada console warning/error.
- [ ] Supabase database lint: `--local` belum dapat terhubung ke PostgreSQL lokal (`LegacyDbConnectError`) dan repository belum ditautkan ke project Supabase staging untuk `--linked`.

## Batasan environment saat implementasi

Supabase lokal memerlukan Docker. Bila Docker tidak tersedia, test migrasi/RLS lokal penuh harus dijalankan di CI atau mesin staging sebelum release. Migrasi `20260715010015_quality_security.sql` dan `20260715010016_permanent_catalog_deletion.sql` tetap wajib diterapkan dan diverifikasi pada project Supabase staging sebelum UAT.
