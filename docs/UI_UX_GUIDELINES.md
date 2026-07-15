# Panduan UI/UX

## 1. Tujuan

Antarmuka publik harus membantu pengunjung memahami produk dan membeli dengan sedikit hambatan. Dashboard harus membantu admin mulai berjualan, menambah produk, dan memperbarui profil toko tanpa pengetahuan teknis.

## 2. Prinsip

- Hierarki visual jelas.
- CTA utama konsisten.
- Form singkat dan mudah dipahami.
- Informasi harga dan stok terlihat.
- Mobile-first.
- Feedback cepat untuk setiap tindakan.
- Gunakan bahasa sehari-hari seperti **Tambah Produk**, **Harga Jual**, **Harga Sebelum Diskon**, **Tujuan Tombol Beli**, dan **Terbitkan**.
- Batasi satu CTA utama per area dan sembunyikan opsi lanjutan sampai dibutuhkan.

## 3. Design System

Gunakan token:

- background
- foreground
- primary
- secondary
- muted
- accent
- destructive
- border
- input
- ring

Gunakan komponen shadcn/ui dan Radix UI sebelum membuat komponen dasar baru.

## 4. Responsive Breakpoints

- Mobile: katalog 1–2 kolom.
- Tablet: 2–3 kolom.
- Desktop: 3–5 kolom.
- Sidebar dashboard menjadi sheet/drawer pada mobile.
- Table besar dapat menggunakan responsive card atau horizontal scroll.

## 5. Halaman Produk

Kartu produk minimal:

- gambar,
- nama,
- harga jual sebagai harga utama,
- harga pembanding dicoret hanya bila nilainya lebih tinggi daripada harga jual,
- label atau persentase diskon bila relevan,
- status stok,
- tombol **Beli**,
- focus/hover state.

Perilaku kartu produk:

- Klik gambar, nama, harga, atau area kosong kartu membuka halaman detail produk.
- Tombol **Beli** merupakan kontrol terpisah yang langsung membuka tujuan CTA produk.
- Klik tombol **Beli** tidak boleh ikut memicu navigasi ke halaman detail.
- Kartu dan tombol harus dapat diakses dengan keyboard serta memiliki focus state yang berbeda.
- Pada layar sentuh, area klik cukup besar dan tidak bergantung pada hover.

Detail produk:

- galeri di bagian atas pada mobile,
- informasi utama dekat CTA,
- deskripsi terstruktur,
- harga pembanding dicoret di dekat harga jual,
- tombol **Beli** terlihat tanpa perlu mencari,
- kelompok tombol berbagi berlabel **Bagikan Produk** berisi **Salin Link**, **WhatsApp**, **Facebook**, dan **Instagram**,
- produk terkait setelah informasi utama.

Perilaku berbagi:

- **Salin Link** menyalin canonical URL produk dan menampilkan toast **Link produk berhasil disalin**.
- **WhatsApp** membuka share URL WhatsApp dengan nama produk dan tautan yang sudah terisi.
- **Facebook** membuka dialog berbagi Facebook dengan canonical URL produk.
- **Instagram** memakai share sheet perangkat bila didukung agar pengguna dapat memilih Instagram. Karena Instagram tidak menyediakan dialog berbagi URL web universal, fallback-nya adalah menyalin link, membuka aplikasi/website Instagram, lalu menampilkan petunjuk singkat untuk menempelkan link.
- Bila aksi gagal atau browser membatasi popup/clipboard, tampilkan pesan yang menjelaskan langkah alternatif.

## 6. Dashboard

- Navigasi utama menggunakan urutan yang mudah dipahami: **Ringkasan**, **Produk**, **Pesanan**, **Konten Website**, **Pengaturan**, dan **Akun Admin**.
- Untuk admin baru, tampilkan checklist **Mulai Berjualan**: **Lengkapi Profil Toko**, **Tambah Produk**, **Terbitkan Produk**, dan **Uji Tombol Beli**.
- Page header dengan judul, deskripsi singkat, dan satu primary action.
- Halaman produk selalu menampilkan tombol **Tambah Produk** dengan posisi konsisten.
- Filter berada dekat tabel.
- Aksi hapus produk/kategori memakai ikon tong sampah dan membutuhkan dialog konfirmasi yang secara eksplisit menyatakan data dihapus permanen serta tidak dapat dikembalikan.
- Form produk dibagi menjadi **Informasi Dasar**, **Harga**, **Stok**, **Gambar**, **Tombol Beli**, dan **Publikasi**.
- Setiap istilah yang berpotensi membingungkan memiliki helper text dan contoh singkat.
- Opsi lanjutan seperti slug dan SEO berada dalam bagian **Pengaturan Lanjutan** yang dapat dibuka bila diperlukan.
- Aksi akhir memakai label jelas: **Simpan Draft**, **Lihat Pratinjau**, dan **Terbitkan**.
- Gunakan sticky action bar bila relevan.
- Tampilkan validation error dekat field.

### Konten Website dan Profil Toko

- Gunakan menu **Konten Website > Profil Toko** untuk nama toko, tagline, deskripsi, logo, favicon, kontak, alamat, jam operasional, WhatsApp, Facebook, dan Instagram.
- Kelompokkan field sesuai lokasi tampil: **Identitas**, **Kontak**, **Lokasi & Jam Buka**, **Media Sosial**, dan **SEO Dasar**.
- Tampilkan pratinjau header/footer agar admin memahami dampak perubahan.
- Gunakan tombol **Simpan Perubahan** dan tampilkan status terakhir disimpan.

### Pengaturan

- Gunakan halaman mandiri **Pengaturan**, bukan anchor atau pengalihan ke Profil Toko.
- Tempatkan threshold stok rendah, mata uang, zona waktu, ongkir, dan ringkasan kanal pembelian pada halaman ini.
- Pada mobile, navbar harus menjaga menu, identitas toko, dan tombol keluar tetap terlihat tanpa overflow.
- Drawer navigasi mobile harus mentok bagian atas dan bawah viewport (`100dvh`), dengan header/footer tetap dan daftar menu yang dapat di-scroll.
- Pada laptop dan tablet orientasi landscape, sidebar dashboard menggunakan sticky positioning dengan jarak aman dari navbar, tinggi maksimal mengikuti viewport, dan tetap dibatasi oleh area konten agar tidak menutupi footer.

## 7. State

Setiap screen wajib mempertimbangkan:

- loading,
- empty,
- error,
- success,
- disabled,
- permission denied.

Untuk dashboard, state `permission denied` berlaku ketika session bukan admin aktif. Tidak ada perbedaan menu berdasarkan role karena role internal hanya `admin`.

## 8. Accessibility

- Gunakan semantic HTML.
- Semua input memiliki label.
- Semua icon-only button memiliki accessible name.
- Modal mengunci fokus dengan benar.
- Fokus keyboard terlihat.
- Target sentuh minimal memadai.
- Gunakan `aria-live` untuk feedback dinamis bila sesuai.
- Gambar informatif memiliki alt text.

## 9. Dark Mode

- Jangan sekadar membalik warna.
- Pastikan chart, border, dan muted text tetap terbaca.
- Hindari gambar logo yang hilang pada background gelap.
- Simpan preferensi tema melalui theme provider.

## 10. pastikan semua komponent yang bisa memakai komponent ui shadcn, pakai shadcn
