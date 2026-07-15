# Roadmap

## Fase 0 — Discovery ✅

Keputusan final: [`PHASE_0_DISCOVERY.md`](./PHASE_0_DISCOVERY.md).

- [x] Finalisasi scope.
- [x] Finalisasi brand dan konten.
- [x] Validasi alur checkout.
- [x] Tentukan aturan stok dan order.

## Fase 1 — Foundation ✅

- [x] Setup Next.js.
- [x] Setup Tailwind dan shadcn/ui.
- [x] Setup Supabase.
- [x] Setup environment validation.
- [x] Setup lint, test, dan CI.
- [x] Terapkan struktur folder.

## Fase 2 — Database dan Auth

- [x] Migration schema.
- [x] Trigger profile.
- [x] RLS.
- [x] Login/logout/reset password.
- [x] Route protection.
- [x] Role tunggal admin.

## Fase 3 — Dashboard Katalog ✅

- [x] Dashboard overview dasar.
- [x] CRUD produk.
- [x] CRUD kategori.
- [x] Upload gambar ke Supabase Storage beserta penyimpanan path dan URL publik.
- [x] Harga jual dan harga pembanding/coret.
- [x] CTA configuration.
- [x] Form produk sederhana dengan draft, pratinjau, dan terbitkan.
- [x] Activity log.

## Fase 4 — Storefront ✅

- [x] Landing page.
- [x] Katalog.
- [x] Detail produk.
- [x] Klik kartu menuju detail dan tombol **Beli** langsung menuju CTA.
- [x] Share detail produk melalui salin link, WhatsApp, Facebook, dan Instagram.
- [x] Filter/search.
- [x] Cart.
- [x] Halaman informasi.
- [x] SEO dasar.

## Fase 5 — Refactor dan Stabilisasi Storefront ✅

- [x] Rapikan struktur dan konsistensi penamaan kode keranjang.
- [x] Pisahkan tipe, validasi, dan normalisasi data keranjang dari React provider.
- [x] Kurangi duplikasi tampilan keranjang melalui komponen internal yang terfokus.
- [x] Pertahankan alur CTA Custom URL dan WhatsApp yang sudah berjalan.
- [x] Pertahankan layout, styling, tipografi, spacing, dan responsivitas storefront.
- [x] Tambahkan unit test untuk aturan dan data tersimpan keranjang.
- [x] Pastikan type-check, lint, test, dan production build berhasil.

Integrasi Midtrans beserta order dan pembayaran tetap dijadwalkan pada Fase 8 agar dikerjakan pada tahap akhir setelah fitur operasional dan quality selesai.

## Fase 6 — Operasional ✅

- [x] Order management dengan filter, detail, timeline, dan transisi status yang tervalidasi.
- [x] Banner, FAQ, dan testimonial beserta aturan jadwal dan persetujuan publikasi.
- [x] Profil website: nama toko, identitas visual, kontak, alamat, jam operasional, dan media sosial.
- [x] Store settings dengan pratinjau sederhana.
- [x] Low-stock report berdasarkan stok tersedia dan threshold toko.
- [x] Sales chart berdasarkan order dengan pembayaran lunas.
- [x] Metode pembelian aktif dibatasi ke WhatsApp dan tautan eksternal; Midtrans tetap ditunda sampai Fase 8.

## Fase 7 — Quality (sebagian selesai)

- [x] Unit/integration/E2E dengan coverage dan quality gate CI.
- [x] Accessibility audit otomatis WCAG A/AA pada desktop dan mobile, perbaikan kontras, serta skip link keyboard.
- [x] Performance optimization dan performance budget storefront.
- [x] Security hardening pada aplikasi, Auth config, dependency, upload, dan migration/RLS.
- [ ] UAT staging. Memerlukan deployment, Supabase project, akun admin, dan persetujuan tester staging; lihat [`PHASE_7_QUALITY.md`](./PHASE_7_QUALITY.md).

## Fase 8 — Checkout dan Production

Implementasi dan prosedur: [`PHASE_8_PRODUCTION.md`](./PHASE_8_PRODUCTION.md).

- [x] Orders dan order items untuk pencatatan penjualan eksternal oleh admin; CTA publik tidak membuat order otomatis.
- [x] Payment transaction dibatasi hanya untuk WhatsApp dan tautan eksternal.
- [x] Status order, status pembayaran, timeline, activity log, dan rekonsiliasi.
- [x] Production migration dan release gate tersedia.
- [x] Domain canonical `https://toko-online-general-purpose.vercel.app/` diterapkan.
- [x] Monitoring liveness/readiness setiap 15 menit dan issue insiden otomatis.
- [x] Backup database terjadwal beserta restore drill.
- [x] Runbook insiden.

## Fase Lanjutan

- Akun pelanggan.
- Wishlist.
- Voucher.
- Shipping integration.
- Inventory reservation lintas gudang.
- Multi-warehouse.
- Email notification.
- Analytics funnel.
- Multi-language.
- Midtrans Snap.
- Webhook pembayaran yang terverifikasi dan idempotent.
- Keranjang user
- [ ] Aktivasi Midtrans production setelah pengujian sandbox dan UAT selesai. Tetap dinonaktifkan karena UAT staging belum disetujui.
- [ ] Penerapan migration ke production. Wajib melalui backup, UAT approval, dan GitHub Environment `production`.
