# Strategi Pengujian

## 1. Piramida Test

- Unit test untuk utility dan aturan bisnis.
- Integration test untuk repository, action, dan route.
- E2E untuk user journey utama.
- Manual/UAT untuk tampilan dan integrasi payment.

## 2. Unit Test

Prioritas:

- slug generator,
- formatter uang,
- normalisasi WhatsApp,
- template placeholder,
- mapping Midtrans status,
- signature verification,
- helper akses admin,
- Zod schema.

## 3. Integration Test

- create/update/archive produk.
- RLS mengizinkan admin aktif dan menolak akun tanpa profil admin aktif.
- validasi `compare_at_price` harus lebih tinggi daripada `price` bila diisi.
- update profil toko dan revalidation halaman publik.
- checkout menghitung ulang harga.
- duplicate SKU ditolak.
- order dan item dibuat konsisten.
- idempotency key yang sama tidak membuat order atau reservasi ganda.
- reservasi stok dibuat atomik dan mencegah checkout melebihi stok tersedia.
- payment paid melakukan commit stok tepat satu kali.
- deny/cancel/expire dan cleanup kedaluwarsa melepas reservasi tepat satu kali.
- pembayaran terlambat tidak membuat stok negatif dan masuk rekonsiliasi bila perlu.
- webhook update status.
- webhook duplicate aman.
- file upload validation.

## 4. E2E

### Publik

- buka landing page,
- cari produk,
- filter kategori,
- klik area kartu untuk membuka detail,
- klik tombol **Beli** pada kartu untuk langsung membuka CTA tanpa masuk ke detail,
- harga pembanding tampil dicoret,
- bagikan detail melalui salin link, WhatsApp, Facebook, dan Instagram,
- tambah ke cart,
- checkout Midtrans sandbox,
- CTA WhatsApp,
- custom URL.

### Dashboard

- login,
- selesaikan checklist mulai berjualan,
- tambah produk,
- isi harga jual dan harga pembanding,
- simpan draft, lihat pratinjau, lalu terbitkan,
- upload gambar,
- ubah status,
- kelola kategori,
- update order,
- ubah nama toko dan profil website lalu verifikasi perubahan di halaman publik,
- akun admin nonaktif ditolak saat mengakses dashboard.

## 5. Security Test

- manipulasi price payload.
- akses dashboard tanpa session.
- akun tanpa profil admin aktif mencoba menjalankan mutasi dashboard.
- status admin yang dimanipulasi dari client.
- invalid webhook signature.
- upload file berbahaya.
- URL dengan protocol tidak aman.
- XSS pada konten.
- rate limit.

## 6. Test Data

Gunakan factory:

- admins,
- products,
- categories,
- orders,
- payment notifications.

Hindari test bergantung pada data production.

## 7. CI

Pipeline minimum:

1. install.
2. typecheck.
3. lint.
4. unit test.
5. build.
6. integration test.
7. E2E pada staging bila tersedia.

## 8. Quality Gate

Release diblokir bila:

- typecheck gagal,
- test kritis gagal,
- migration gagal,
- build gagal,
- vulnerability kritis belum ditangani.
