# Storage dan Upload

## 1. Bucket

| Bucket | Visibility | Isi |
|---|---|---|
| `product-images` | public atau signed | gambar produk |
| `category-images` | public | gambar kategori |
| `store-assets` | public | logo, favicon, banner |
| `avatars` | private/signed | avatar pengguna |

## 2. Validasi Upload

Validasi di client untuk UX dan ulangi di server:

- MIME type.
- Extension.
- Ukuran file.
- Dimensi minimum/maksimum.
- Jumlah file.
- Kepemilikan entity.
- Nama path.

Jangan mempercayai filename asli.

## 3. Format

Rekomendasi:

- JPEG/WebP/AVIF untuk foto.
- PNG/SVG hanya bila diperlukan.
- Maksimum 5 MB per gambar awal.
- Maksimum 10 gambar per produk.
- Alt text wajib atau fallback ke nama produk.

SVG perlu penanganan ekstra karena dapat membawa konten aktif. Batasi SVG hanya untuk aset internal tepercaya.

## 4. Upload Flow

1. User memilih file.
2. Client melakukan preview.
3. Server memvalidasi admin aktif.
4. Server memvalidasi file.
5. Server membuat path acak.
6. File diunggah.
7. Record database dibuat.
8. Bila transaksi database gagal, file orphan dijadwalkan untuk dibersihkan.

## 5. Delete Flow

- Soft delete record produk tidak langsung menghapus file.
- Hard delete file dilakukan setelah memastikan tidak ada referensi.
- Catat aktivitas.
- Sediakan cleanup job untuk orphan files.

## 6. Storage Policy

- Publik hanya membaca aset public.
- Hanya admin aktif yang boleh upload ke domain yang diizinkan.
- User tidak boleh menulis ke folder entity yang bukan miliknya tanpa pemeriksaan server.
- Service role hanya digunakan pada server.

## 7. Image Optimization

- Gunakan `next/image`.
- Simpan width/height bila berguna.
- Buat thumbnail bila katalog besar.
- Hindari mengirim gambar asli berukuran sangat besar.
- Atur `remotePatterns` atau loader dengan aman.
