# Daftar Fitur

## 1. Halaman Publik

### Landing Page

- Header dan navigasi.
- Hero section.
- Banner promo.
- Kategori unggulan.
- Produk unggulan.
- Produk terbaru.
- Keunggulan toko.
- Testimoni.
- CTA.
- Kontak.
- Footer.

### Katalog Produk

- Grid/list produk.
- Seluruh area kartu selain kontrol aksinya dapat diklik untuk membuka detail produk.
- Tombol **Beli** pada kartu langsung membuka tujuan CTA produk dan tidak menjalankan navigasi kartu.
- Pencarian berdasarkan nama, SKU, dan kata kunci.
- Filter kategori.
- Filter rentang harga.
- Filter ketersediaan.
- Sorting terbaru, harga, nama, dan popularitas.
- Pagination.
- Empty state dan error state.

### Detail Produk

- Galeri gambar.
- Nama, harga jual, harga pembanding yang dicoret, persentase diskon, stok, SKU, kategori.
- Deskripsi.
- CTA dinamis.
- Produk terkait.
- Structured data.
- Tombol berbagi: salin tautan, WhatsApp, Facebook, dan Instagram.

### Keranjang

- Hanya menerima produk aktif dengan CTA Midtrans.
- Tambah, ubah jumlah, dan hapus item.
- Perhitungan subtotal.
- Validasi stok ulang sebelum checkout.
- Penyimpanan client-side sementara.
- Sinkronisasi opsional pada tahap berikutnya.

### Checkout

- Informasi pelanggan.
- Alamat pengiriman lengkap untuk checkout Midtrans.
- Ringkasan item.
- Custom URL dan WhatsApp langsung menjalankan CTA tanpa masuk keranjang atau membuat order.
- Midtrans menyediakan buy-now dan checkout keranjang.
- Ongkir tetap toko; integrasi tarif kurir berada di fase lanjutan.
- Pembuatan order.
- Reservasi stok selama 30 menit.
- Status pembayaran.
- Halaman sukses, pending, gagal, atau kedaluwarsa.

### Halaman Informasi

- Tentang toko.
- Kontak.
- FAQ.
- Kebijakan privasi.
- Syarat dan ketentuan.
- Status pesanan.
- 404.
- Error page.

## 2. Autentikasi

- Login email dan password.
- Logout.
- Pemulihan password.
- Validasi session server-side.
- Redirect berdasarkan autentikasi.
- Proteksi dashboard.
- Sinkronisasi profile Supabase Auth ke tabel `profiles`.

## 3. Dashboard

### Overview

- Checklist mulai berjualan: lengkapi profil toko, tambah produk, terbitkan produk, dan uji tombol beli.
- Total produk.
- Produk aktif/nonaktif.
- Total kategori.
- Total order.
- Pendapatan.
- Produk stok rendah.
- Produk terlaris.
- Grafik penjualan.
- Aktivitas terbaru.

### Produk

- Create, read, update, archive.
- Status draft, active, inactive, archived.
- Galeri gambar.
- Slug otomatis dan override.
- SKU unik.
- Harga jual dan harga pembanding/coret dengan validasi yang mudah dipahami.
- Stok.
- Kategori.
- SEO metadata.
- CTA produk.
- Bulk activate/deactivate.
- Filter, sorting, dan pagination.
- Form tambah/edit dibagi menjadi bagian pendek: informasi dasar, harga, stok, gambar, CTA, dan publikasi.
- Pilihan **Simpan Draft** dan **Terbitkan** selalu jelas, dengan pratinjau produk sebelum publikasi.

### Kategori

- CRUD.
- Hierarki opsional melalui `parent_id`.
- Status aktif.
- Gambar atau ikon.
- Urutan tampil.
- Slug unik.

### Pesanan

- Daftar dan detail.
- Filter status order dan pembayaran.
- Perubahan status.
- Timeline status.
- Data pelanggan.
- Item dan nominal.
- Informasi payment.
- Export CSV pada tahap lanjutan.

### Konten

- Banner.
- Testimoni.
- FAQ.
- Halaman statis.
- Profil toko: nama, tagline, deskripsi, logo, favicon, kontak, alamat, dan jam operasional.
- Tautan sosial media, termasuk WhatsApp, Facebook, dan Instagram.
- Pratinjau perubahan profil pada area publik utama.

### Pengaturan

- Identitas toko.
- Logo dan favicon.
- WhatsApp.
- Mata uang.
- Zona waktu.
- SEO.
- Konfigurasi Midtrans.
- Default CTA.
- Threshold stok rendah.

### Pengguna

- Daftar akun admin internal.
- Tambah atau undang admin.
- Aktif/nonaktif akun admin.
- Semua akun internal memakai role `admin`; UI tidak menampilkan pemilih role.
- Audit aktivitas.

## 4. Cross-Cutting Features

- Dark/light mode.
- Toast notification.
- Loading skeleton.
- Empty, error, dan success state.
- Error boundary.
- Logging terstruktur.
- Activity log.
- Rate limiting endpoint publik sensitif.
- SEO dan sitemap.
- Responsive design.
- Bahasa antarmuka singkat, konsisten, dan berorientasi tugas agar admin baru dapat berjualan tanpa panduan teknis.
