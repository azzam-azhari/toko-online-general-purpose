# Fase 8 — Checkout dan Production

Status implementasi kode: **selesai**  
Status release production: **menunggu UAT staging dan persetujuan pemilik produk**

Dokumen ini menjadi acuan operasional Fase 8. Keputusan Fase 0 tetap berlaku: klik CTA WhatsApp atau tautan eksternal tidak otomatis membuat order. Admin mencatat order hanya setelah menerima data pesanan dari kanal tersebut.

## 1. Scope yang Diaktifkan

- Kanal penjualan aktif hanya `whatsapp` dan `custom_url`.
- Produk `midtrans` tetap ditolak oleh validasi aplikasi, repository publik, dan constraint database.
- Admin dapat mencatat order eksternal dengan satu atau lebih item.
- Harga, status produk, kanal, dan stok diverifikasi ulang dari database.
- `order_items` menyimpan snapshot nama, SKU, harga, jumlah, dan total baris.
- `payment_transactions` menjadi ledger verifikasi manual untuk WhatsApp atau penyedia tautan eksternal.
- Admin dapat memperbarui status pembayaran dan fulfillment melalui state machine tervalidasi.
- Pengunjung dapat memeriksa status menggunakan nomor order serta email atau nomor telepon yang cocok.

## 2. Aturan Order Eksternal

1. CTA publik membuka WhatsApp atau URL HTTPS tanpa membuat order.
2. Admin membuka **Pesanan > Catat Pesanan** setelah menerima data pelanggan.
3. Satu order hanya berisi produk dari kanal yang sama.
4. Produk harus aktif, belum dihapus, memiliki stok tersedia, dan bukan Midtrans.
5. Server menghitung subtotal dari harga database; nilai harga dari browser tidak diterima.
6. `idempotency_key` mencegah double-submit membuat order kedua.
7. Saat order dibuat, payment ledger berstatus `unpaid`; stok belum dikurangi dan tidak direservasi.
8. Saat admin menandai pembayaran `paid`, stok dikurangi satu kali dan order `pending` menjadi `confirmed`.
9. Bila stok tidak cukup saat pembayaran diverifikasi, pembayaran tetap tercatat sebagai fakta tetapi order diberi `reconciliation_required`; stok tidak dibuat negatif.
10. Refund tidak otomatis mengembalikan stok karena keadaan fulfillment perlu diperiksa admin.

## 3. Status

### Pembayaran

```text
unpaid -> pending | paid | failed | expired
pending -> paid | failed | expired
failed | expired -> pending | paid
paid -> refunded
refunded -> final
```

### Fulfillment

```text
confirmed -> processing -> shipped -> completed
pending | confirmed | processing -> cancelled
```

Pembayaran `paid` otomatis mengubah order `pending` menjadi `confirmed` hanya bila pengurangan stok berhasil. Pembayaran gagal/kedaluwarsa membatalkan order yang masih `pending`.

## 4. Migration Production

Migration Fase 8: `supabase/migrations/20260715010017_checkout_production.sql`.

Migration ini:

- mengganti nama constraint Fase 6 menjadi constraint kanal eksternal permanen;
- menambahkan `orders.sales_channel` dan `orders.source_reference`;
- membatasi provider payment transaction ke `whatsapp` atau `custom_url`;
- menambahkan index order/payment;
- menambahkan RPC `create_external_order` dan `update_external_payment_status`;
- mempertahankan RLS admin-only dan activity log.

Migration sengaja berhenti bila menemukan transaksi provider non-eksternal. Data tersebut harus direview, bukan ditulis ulang diam-diam.

Riwayat migration project production saat audit masih kosong walaupun schema sudah tersedia. Ikuti [`PRODUCTION_MIGRATION_BASELINE.md`](./PRODUCTION_MIGRATION_BASELINE.md); jangan memakai `--include-all` atau menjalankan ulang migration 001–016.

## 5. Domain dan Environment

Domain canonical production:

```text
https://toko-online-general-purpose.vercel.app/
```

Wajib tersedia pada Vercel production:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_SUPABASE_URL`
- salah satu publishable/anon key Supabase
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_DEFAULT_WHATSAPP_NUMBER` bila nomor toko belum diisi

Midtrans harus tetap:

```env
MIDTRANS_IS_PRODUCTION=false
```

Jangan menambahkan production client/server key sampai seluruh test sandbox, webhook, rekonsiliasi stok, UAT staging, dan persetujuan tertulis selesai.

## 6. Release Gate

Workflow `.github/workflows/production-release.yml` hanya dapat dijalankan manual dan memerlukan:

- input `uat_approved = true`;
- konfirmasi `RELEASE-PRODUCTION`;
- approval GitHub Environment `production`;
- seluruh secret production;
- quality gate berhasil;
- backup pre-migration berhasil;
- dry-run migration berhasil.

Urutan workflow: quality gate → backup → migration dry-run → migration production → trigger deploy Vercel → smoke test liveness/readiness.

## 7. Monitoring

- `/api/health` memeriksa liveness aplikasi.
- `/api/health/ready` memeriksa koneksi database tanpa mengekspos detail internal.
- `.github/workflows/production-monitor.yml` berjalan setiap 15 menit.
- Kegagalan membuat satu issue insiden terbuka; recovery memberi komentar dan menutup issue.
- Log server hanya menyimpan kode error, bukan kontak pelanggan, token, atau payment payload.

Metric operasional minimum yang ditinjau harian:

- 5xx dan readiness failure;
- auth failure;
- kegagalan pencatatan order;
- order `reconciliation_required`;
- payment `failed`/`expired`;
- error Storage dan database;
- pertumbuhan ukuran database dan koneksi.

## 8. Backup dan Restore

`.github/workflows/production-backup.yml` membuat backup harian pukul 01:17 WIB:

- schema;
- roles;
- data menggunakan COPY;
- artifact terenkripsi AES-256 dengan retensi 14 hari.

Secret wajib: `SUPABASE_PRODUCTION_DB_URL` dan `BACKUP_ENCRYPTION_PASSPHRASE`. Akses workflow/artifact harus dibatasi kepada operator production. Lakukan restore drill berkala pada project terpisah; jangan menguji restore pada database production.

## 9. Acceptance Fase 8

- [x] Orders dan order items tersedia dengan snapshot serta idempotency.
- [x] Payment ledger hanya menerima WhatsApp dan tautan eksternal.
- [x] Status payment dan order memiliki transisi tervalidasi serta activity log.
- [x] Lookup status publik memerlukan nomor order dan kontak yang cocok serta rate limit.
- [x] Migration production tersedia dan memiliki release gate.
- [x] Domain canonical dikunci ke URL production.
- [x] Monitoring liveness/readiness dan issue insiden tersedia.
- [x] Backup terjadwal dan prosedur restore tersedia.
- [x] Runbook insiden tersedia di [`INCIDENT_RUNBOOK.md`](./INCIDENT_RUNBOOK.md).
- [ ] UAT staging memiliki bukti dan persetujuan pemilik produk.
- [ ] Migration diterapkan ke production melalui workflow yang disetujui.
- [ ] Aktivasi Midtrans production; tetap diblokir sampai sandbox dan UAT Midtrans selesai.

## 10. Bukti Verifikasi Lokal dan Remote — 15 Juli 2026

- TypeScript dan ESLint lulus.
- 72 unit/integration test lulus dengan coverage 89,47% statements, 77,70% branches, 96,36% functions, dan 93,02% lines.
- Production build lulus dan menghasilkan 35 route, termasuk order status, readiness, pencatatan order, dan detail payment.
- 32 E2E/accessibility/security test desktop dan mobile lulus.
- Seluruh workflow YAML berhasil diparse.
- Domain production dan `/api/health` merespons HTTP 200.
- `/api/health/ready` masih HTTP 404 karena perubahan Fase 8 belum dideploy; ini menjadi bagian smoke test workflow release.
- Supabase project terhubung berstatus `ACTIVE_HEALTHY`.
- Audit read-only menemukan history migration remote kosong untuk 001–017; prosedur rekonsiliasi didokumentasikan dan workflow release akan menolak release sampai 001–016 tercatat.
- Database lint remote memiliki satu warning pada `save_store_settings` versi live; migration 017 mendeklarasikan ulang fungsi dengan UUID constant eksplisit untuk memperbaikinya.
