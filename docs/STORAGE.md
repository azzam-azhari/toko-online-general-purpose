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
7. URL publik/signed yang sesuai diambil dari bucket dan divalidasi.
8. `storage_path` dan URL file disimpan pada record gambar dalam transaksi penyimpanan produk.
9. Bila URL tidak dapat diperoleh atau transaksi database gagal, file yang baru diunggah dibersihkan dan record tidak dibuat.

## 5. Delete Flow

- Admin harus melihat konfirmasi bahwa produk/kategori yang dihapus tidak dapat dikembalikan.
- Fungsi database menghapus record produk/kategori secara permanen dalam satu transaksi, termasuk relasi berantai, lalu mencatat snapshot `before_data` pada activity log.
- Fungsi database mengembalikan daftar path gambar sebelum record gambar terhapus.
- Server Action yang sudah memvalidasi admin aktif memakai service role hanya di server untuk menghapus path tersebut dan seluruh file yang tersisa di folder entity pada bucket terkait.
- Path harus berada di folder UUID entity, tidak boleh absolut, mengandung traversal (`..`), backslash, atau karakter kontrol.
- Cleanup Storage dicoba ulang sekali. Bila masih gagal, UI wajib memberi peringatan jujur bahwa data database sudah terhapus tetapi cleanup file belum terverifikasi.
- Cleanup orphan files terjadwal tetap disarankan sebagai pertahanan tambahan untuk kegagalan layanan eksternal.

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
