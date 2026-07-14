# Product Requirements Document

## 1. Latar Belakang

Banyak toko membutuhkan storefront yang fleksibel tanpa harus dikunci pada satu jenis produk. Aplikasi ini menyediakan fondasi toko online yang dapat digunakan untuk menjual barang fisik, produk digital, jasa, pre-order, atau produk katalog yang transaksinya diarahkan ke kanal lain.

## 2. Visi Produk

Menyediakan toko online general-purpose yang cepat, menarik, mudah dikelola, dan dapat mengarahkan pembeli ke metode checkout yang paling sesuai.

## 3. Tujuan

- Pengunjung dapat menemukan produk relevan dengan cepat.
- Pengunjung memahami nilai produk sebelum melakukan pembelian.
- Admin dapat memperbarui katalog, konten website, dan profil toko tanpa mengubah kode.
- Admin dapat mengontrol akun internal, konfigurasi toko, dan integrasi pembayaran.
- Sistem mampu mendukung pertumbuhan katalog dan volume transaksi.

## 4. Non-Goals Tahap Awal

- Marketplace multi-vendor.
- Loyalty point.
- Aplikasi native mobile.
- Multi-warehouse penuh.
- Advanced shipping rate engine.
- Autentikasi pelanggan wajib.
- Subscription billing.

## 5. Persona

### Pengunjung

- Menjelajah produk tanpa login.
- Membandingkan harga dan informasi.
- Membeli melalui URL, WhatsApp, atau Midtrans.

### Admin

- Menjadi satu-satunya role untuk akun internal/dashboard.
- Mengelola katalog, stok, kategori, banner, pesanan, dan aktivitas operasional.
- Mengelola profil website, termasuk nama toko, deskripsi, logo, kontak, alamat, jam operasional, dan tautan media sosial.
- Mengelola akun admin internal, termasuk mengundang dan menonaktifkan akun.
- Mengubah konfigurasi kritis toko.
- Melihat laporan serta activity log.

## 6. User Journey Utama

### Menjelajah dan membeli

1. Pengunjung membuka landing page.
2. Pengunjung melihat kategori, promo, produk terbaru, atau produk unggulan.
3. Pengunjung mencari atau memfilter produk.
4. Saat area kartu produk diklik, pengunjung membuka halaman detail produk.
5. Saat tombol **Beli** pada kartu diklik, sistem langsung membuka tujuan CTA produk tanpa melewati halaman detail.
6. Pada halaman detail, pengunjung dapat membagikan produk melalui salin tautan, WhatsApp, Facebook, atau Instagram.
7. Pengunjung memilih CTA:
   - tautan eksternal,
   - WhatsApp,
   - Midtrans.
8. Sistem mengarahkan pengunjung sesuai konfigurasi produk.
9. Untuk Midtrans, sistem membuat order server-side dan menampilkan Snap.
10. Status pembayaran diperbarui melalui webhook.

### Mengelola produk

1. Admin login.
2. Sistem memvalidasi session dan status admin aktif.
3. Admin memilih menu **Produk** lalu menekan **Tambah Produk**.
4. Admin mengisi form berbahasa sederhana yang dibagi menjadi informasi dasar, harga, stok, gambar, dan tujuan tombol beli.
5. Admin dapat mengisi harga jual dan harga pembanding agar harga lama tampil dicoret saat lebih tinggi dari harga jual.
6. Admin melihat pratinjau ringkas sebelum menyimpan sebagai draft atau menerbitkan produk.
7. Sistem memvalidasi data.
8. Gambar diunggah ke Supabase Storage.
9. Data produk tersimpan dan cache yang relevan di-refresh.
10. Aktivitas dicatat dan UI menampilkan konfirmasi yang jelas.

### Mengelola profil website

1. Admin membuka **Konten Website > Profil Toko**.
2. Admin mengubah nama toko, tagline, deskripsi, logo, favicon, kontak, alamat, jam operasional, dan tautan media sosial.
3. Admin melihat pratinjau perubahan yang akan tampil pada header, footer, halaman tentang, dan metadata dasar.
4. Admin menyimpan perubahan.
5. Sistem memvalidasi data, mencatat aktivitas, dan memperbarui halaman publik terkait.

## 7. Functional Requirements

### Katalog

- Produk memiliki nama, slug, SKU, deskripsi, harga jual, harga pembanding/coret, stok, status, dan konfigurasi CTA.
- Harga pembanding bersifat opsional dan harus lebih tinggi daripada harga jual agar ditampilkan sebagai harga yang dicoret.
- Produk dapat memiliki banyak gambar dan banyak kategori.
- Produk dapat ditandai sebagai unggulan.
- Produk dapat diurutkan dan difilter.
- Produk nonaktif, draft, atau terhapus tidak tampil ke publik.
- Klik pada area kartu produk membuka halaman detail produk.
- Klik tombol **Beli** pada kartu langsung menjalankan CTA produk dan tidak memicu navigasi kartu.
- Detail produk menyediakan tombol salin tautan, WhatsApp, Facebook, dan Instagram.

### Checkout

- `custom_url`: membuka URL yang tervalidasi.
- `whatsapp`: membuat tautan `wa.me` dengan pesan dinamis.
- `midtrans`: membuat order dan transaksi pembayaran dari server.

### Dashboard

- Ringkasan KPI.
- CRUD produk dan kategori.
- Manajemen pesanan.
- Manajemen konten.
- Profil website dan pengaturan toko yang dapat diubah tanpa menyentuh kode.
- Activity log.
- Akses dashboard khusus admin aktif.

## 8. Non-Functional Requirements

### Performa

- Halaman katalog harus mengutamakan Server Components.
- Gambar menggunakan `next/image`.
- Komponen berat dimuat secara dinamis.
- Query database memakai index yang sesuai.
- Daftar panjang menggunakan pagination.

### Keamanan

- Secret hanya tersedia di server.
- Input divalidasi di server.
- Webhook diverifikasi.
- Harga order dihitung ulang dari database.
- RLS aktif untuk tabel yang terekspos melalui Supabase.
- Operasi sensitif dicatat pada activity log.

### Reliabilitas

- Webhook bersifat idempotent.
- Order ID unik.
- Error eksternal tidak menghapus data order.
- Retry aman untuk proses sinkronisasi pembayaran.

### Aksesibilitas

- Navigasi keyboard.
- Label form yang jelas.
- Kontras warna memadai.
- Fokus terlihat.
- Status tidak hanya dibedakan dengan warna.

## 9. Success Metrics

- Conversion rate dari detail produk ke CTA.
- Persentase checkout Midtrans berhasil.
- Bounce rate landing page.
- Waktu rata-rata admin membuat produk.
- Jumlah error checkout.
- Waktu muat halaman katalog.
- Jumlah stok kosong yang terlambat ditangani.

## 10. Acceptance Criteria Utama

- Produk aktif dapat ditemukan melalui katalog dan detail.
- Produk nonaktif tidak dapat dibeli melalui URL publik.
- Semua akun dashboard menggunakan role `admin`; tidak ada role operasional kedua atau pemilih role pada UI.
- Harga pembanding yang valid tampil dicoret pada kartu dan detail produk.
- Klik kartu membuka detail, sedangkan klik tombol **Beli** langsung membuka tujuan CTA yang dikonfigurasi.
- Tombol berbagi di detail produk tersedia untuk salin tautan, WhatsApp, Facebook, dan Instagram.
- Perubahan profil toko dapat dilakukan admin melalui UI dan tampil pada area publik yang relevan.
- Nominal Midtrans berasal dari database, bukan body client.
- Webhook dengan signature tidak valid ditolak.
- Penghapusan gambar membersihkan referensi database secara aman.
- Semua mutasi penting menghasilkan activity log.
