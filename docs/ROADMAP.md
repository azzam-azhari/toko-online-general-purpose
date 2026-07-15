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

## Fase 6 — Operasional

- Order management.
- Banner, FAQ, dan testimonial.
- Profil website: nama toko, identitas visual, kontak, alamat, jam operasional, dan media sosial.
- Store settings dengan pratinjau sederhana.
- Low-stock report.
- Sales chart.

## Fase 7 — Quality

- Unit/integration/E2E.
- Accessibility audit.
- Performance optimization.
- Security hardening.
- UAT staging.

## Fase 8 — Checkout dan Production

- Midtrans Snap.
- Orders dan order items.
- Payment transaction.
- Webhook pembayaran yang terverifikasi dan idempotent.
- Status order.
- Production migration.
- Domain.
- Aktivasi Midtrans production setelah pengujian sandbox dan UAT selesai.
- Monitoring.
- Backup.
- Runbook insiden.

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
