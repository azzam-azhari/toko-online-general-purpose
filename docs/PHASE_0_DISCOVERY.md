# Fase 0 — Discovery

Status: **selesai dan menjadi baseline implementasi**  
Tanggal keputusan: **15 Juli 2026**

Dokumen ini memfinalkan keputusan Fase 0. Bila ada rincian yang bertentangan dengan dokumen lama, keputusan di dokumen ini berlaku sampai ada decision record baru.

## 1. Scope MVP

### Dalam scope

- Satu toko dan satu katalog; bukan marketplace.
- Pasar awal Indonesia, bahasa Indonesia, mata uang IDR, dan zona waktu `Asia/Jakarta`.
- Storefront publik tanpa kewajiban login pelanggan.
- Katalog produk, kategori, pencarian, filter, detail produk, berbagi produk, dan keranjang.
- Tiga CTA per produk: `custom_url`, `whatsapp`, atau `midtrans`.
- Checkout tamu melalui Midtrans Snap untuk produk fisik yang stoknya dilacak.
- Ongkir sederhana berupa satu tarif tetap toko; nilai `0` berarti gratis. Integrasi kurir dan tarif berdasarkan wilayah belum termasuk.
- Dashboard dengan satu role internal, `admin`, untuk katalog, stok, pesanan, konten, profil toko, pengaturan, akun admin, dan activity log.
- Konten publik utama: beranda, katalog, detail produk, tentang, kontak, FAQ, privasi, serta syarat dan ketentuan.
- Supabase untuk database, Auth, dan Storage; Midtrans untuk pembayaran; WhatsApp memakai deep link.

### Di luar scope MVP

- Marketplace/multi-vendor, multi-store, dan multi-warehouse.
- Akun pelanggan, wishlist tersinkron, loyalty point, voucher, subscription, dan aplikasi native.
- Tarif kurir real-time, pelacakan kurir otomatis, dan cash on delivery.
- Reservasi lintas gudang, backorder, partial fulfillment, dan split shipment.
- Multi-language dan mata uang selain IDR.

### Batas produk per CTA

| CTA | Perilaku | Keranjang | Order internal |
|---|---|---:|---:|
| `custom_url` | Buka URL `https` yang telah divalidasi | Tidak | Tidak |
| `whatsapp` | Buka `wa.me` dengan pesan produk | Tidak | Tidak |
| `midtrans` | **Beli** memulai buy-now; **Tambah ke Keranjang** tersedia terpisah | Ya | Ya |

Keranjang hanya boleh berisi produk `midtrans` yang aktif. Produk dengan tipe CTA berbeda tidak boleh digabung menjadi satu checkout.

## 2. Brand dan Konten

### Identitas final MVP

- Nama: **NusaMart**.
- Tagline: **Pilihan Tepat, Hidup Lebih Hebat**.
- Posisi merek: toko general-purpose dengan produk pilihan untuk kebutuhan harian dan gaya hidup modern.
- Kepribadian: hangat, tepercaya, praktis, optimistis, dan tidak berlebihan.
- Bahasa: Indonesia yang ringkas; gunakan istilah yang mudah dipahami seperti **Harga Jual**, **Stok Tersedia**, **Tambah ke Keranjang**, dan **Beli Sekarang**.
- Logo MVP: wordmark **NusaMart** dengan monogram **N**. Admin tetap dapat mengganti logo melalui profil toko.

### Arah visual

| Token | Nilai | Penggunaan utama |
|---|---|---|
| Forest | `#164E3C` | CTA dan elemen merek utama |
| Forest dark | `#0D392B` | Header gelap/footer |
| Coral | `#E66F51` | Aksen, promo, dan badge |
| Gold | `#F2B84B` | Aksen hangat |
| Cream | `#F7F4ED` | Latar lembut |
| Paper | `#FFFDF8` | Latar halaman |
| Ink | `#17231F` | Teks utama |

- Heading pemasaran: **DM Serif Display**.
- UI, isi, form, dan dashboard: **Plus Jakarta Sans**.
- Komponen UI standar menggunakan shadcn/ui; token merek diterapkan melalui tema, bukan dengan menduplikasi komponen dasar.

### Copy baseline

- Hero title: **Pilihan tepat untuk hari yang lebih hebat.**
- Hero body: **Temukan kebutuhan harian dan pelengkap gaya hidup dalam pilihan yang mudah dijelajahi, dengan cara membeli yang sesuai untuk setiap produk.**
- CTA utama: **Belanja Sekarang**.
- CTA sekunder: **Jelajahi Kategori**.
- Deskripsi singkat footer: **Produk pilihan untuk membuat belanja kebutuhan harian dan gaya hidup terasa lebih praktis.**

### Aturan konten

- Nama produk, jumlah produk, harga, stok, promo, ulasan, testimoni, dan countdown harus berasal dari data nyata; tidak boleh menjadi klaim statis palsu.
- Klaim seperti “ribuan produk”, “dikirim dalam 24 jam”, “garansi 14 hari”, jumlah pelanggan, dan testimoni pada prototipe dianggap **data demo**, bukan copy production yang disetujui.
- Countdown hanya tampil bila memiliki waktu berakhir yang tersimpan di database. Setelah berakhir, promo tidak boleh tetap terlihat aktif.
- Testimoni hanya diterbitkan dengan persetujuan pemilik testimoni. Nama dan foto demo tidak boleh masuk production.
- Tautan sosial, kontak, jam buka, kebijakan pengiriman/pengembalian, privasi, dan syarat ketentuan wajib diisi admin sebelum production.
- Newsletter bukan bagian MVP dan tidak ditampilkan sampai ada penyimpanan consent, kebijakan privasi, dan mekanisme berhenti berlangganan.

## 3. Alur Checkout Final

### Custom URL

1. Pengunjung menekan **Beli**.
2. Sistem memvalidasi URL hanya menggunakan protokol `https` dan menolak URL kosong/tidak aman.
3. Browser membuka URL sesuai konfigurasi `open_in_new_tab`.
4. Event CTA dicatat tanpa membuat order.

### WhatsApp

1. Pengunjung menekan **Beli**.
2. Sistem memilih nomor produk, lalu nomor toko, lalu environment fallback.
3. Nomor dinormalisasi dan template diisi dari data produk tepercaya.
4. Browser membuka `wa.me`; sistem tidak membuat order sebelum ada proses operasional lanjutan.

### Midtrans

1. Produk **Beli** memulai buy-now dengan jumlah awal `1`; **Tambah ke Keranjang** memasukkan produk ke keranjang Midtrans.
2. Server menerima `productId` dan `quantity`, lalu mengambil ulang nama, harga, status, CTA, dan stok dari database.
3. Checkout meminta nama, email, nomor WhatsApp/telepon, dan alamat pengiriman lengkap.
4. Server menghitung subtotal, ongkir tetap, dan grand total. Harga atau total dari client diabaikan.
5. Dalam transaksi database, server mengunci baris produk, memeriksa stok tersedia, membuat order serta snapshot item, dan mereservasi stok.
6. Server membuat transaksi Midtrans Snap menggunakan `order_number` unik dan idempotency key.
7. Bila pembuatan Snap gagal, order ditandai gagal/dibatalkan dan reservasi dilepas secara aman.
8. Client hanya menerima `orderNumber`, `snapToken`, `redirectUrl`, dan waktu kedaluwarsa.
9. Status popup/redirect hanya untuk UX. Webhook Midtrans yang lolos verifikasi menjadi sumber kebenaran pembayaran.
10. Halaman status pesanan membaca status dari server. Lookup publik memerlukan kombinasi order number dan email atau nomor telepon yang cocok.

### Aturan kegagalan dan retry

- Satu `idempotencyKey` hanya boleh menghasilkan satu order aktif.
- Double-submit, retry jaringan, dan webhook duplikat tidak boleh membuat order atau pengurangan stok ganda.
- Order tetap tercatat saat Midtrans timeout agar dapat direkonsiliasi.
- Webhook dengan signature salah ditolak dan dicatat tanpa mengubah order.
- Nominal, status produk, dan stok selalu diverifikasi ulang di server.

## 4. Aturan Stok

### Model stok

- `stock` adalah jumlah fisik yang dimiliki (`on hand`).
- `reserved_stock` adalah jumlah yang ditahan untuk order belum final.
- Stok tersedia dihitung sebagai `stock - reserved_stock` dan tidak boleh negatif.
- Produk `midtrans` wajib memakai stok terkelola. Produk habis tidak dapat dibeli atau ditambahkan ke keranjang.
- Threshold stok rendah default `5` dan dapat diubah di pengaturan toko.

### Siklus reservasi

- Reservasi dibuat atomik saat order Midtrans dibuat, sebelum Snap diberikan ke client.
- Durasi reservasi awal: **30 menit** dan disimpan pada `orders.expires_at`.
- Pembayaran `paid`: kurangi `stock` dan `reserved_stock` dalam transaksi yang sama.
- `deny`, `cancel`, atau `expire`: lepaskan `reserved_stock`; `stock` tidak berubah.
- Cleanup terjadwal melepaskan reservasi yang melewati `expires_at` bila webhook terlambat/tidak pernah datang.
- Webhook pembayaran yang datang setelah reservasi dilepas tidak boleh langsung memaksa stok negatif. Tandai untuk rekonsiliasi admin dan jangan otomatis mengonfirmasi fulfillment bila stok tidak cukup.
- Perubahan stok manual oleh admin wajib memiliki alasan dan activity log.

## 5. Aturan Order

### Sumber order

- Hanya checkout Midtrans yang otomatis membuat order pada MVP.
- Custom URL dan WhatsApp hanya mencatat event CTA. Pencatatan order manual dari kanal tersebut merupakan fase lanjutan.

### Status dan transisi

| Kejadian | Payment status | Order status |
|---|---|---|
| Order dan Snap dibuat | `pending` | `pending` |
| `settlement` atau `capture` + fraud accepted | `paid` | `confirmed` |
| `deny` | `failed` | `cancelled` |
| `cancel` | `failed` | `cancelled` |
| `expire` | `expired` | `cancelled` |
| Refund sebelum diproses | `refunded` | `cancelled` |
| Refund setelah diproses/dikirim/selesai | `refunded` | status fulfillment dipertahankan dan masuk rekonsiliasi admin |

Transisi fulfillment oleh admin hanya boleh mengikuti:

```text
confirmed -> processing -> shipped -> completed
pending/confirmed/processing -> cancelled
```

- Order yang sudah `shipped` atau `completed` tidak dapat dibatalkan biasa; gunakan proses refund/rekonsiliasi.
- Order berbayar tidak boleh dianggap direfund hanya karena admin menekan batal. Refund harus dikonfirmasi oleh Midtrans/webhook.
- Semua perubahan status menyimpan waktu, aktor, alasan bila manual, dan activity log.
- `order_items` selalu menjadi snapshot sehingga perubahan/hapus produk tidak mengubah histori order.
- Data order dan pelanggan tidak boleh dihapus permanen dari dashboard. Retensi dan penghapusan data mengikuti kebijakan privasi yang disetujui sebelum production.

## 6. Acceptance Fase 0

- [x] Scope MVP dan non-goals tidak ambigu.
- [x] Nama, tagline, arah visual, suara, dan copy baseline ditetapkan.
- [x] Konten demo dipisahkan dari klaim production.
- [x] Perilaku ketiga CTA dan batas keranjang divalidasi.
- [x] Checkout Midtrans memiliki validasi server, idempotency, webhook, dan jalur kegagalan.
- [x] Reservasi, pengurangan, pelepasan, dan rekonsiliasi stok ditetapkan.
- [x] State machine order dan payment dipisahkan.

## 7. Dampak ke Implementasi

- Tambahkan `reserved_stock` pada produk dan constraint stok tersedia.
- Tambahkan `expires_at` dan `idempotency_key` unik pada order.
- Tambahkan tarif ongkir tetap dan threshold stok rendah ke `store_settings`.
- Sediakan fungsi/transaksi database untuk reserve, commit, dan release stok; jangan menyebarkan logika ini ke komponen UI.
- Sediakan cleanup reservasi kedaluwarsa dan antrean/penanda rekonsiliasi pembayaran terlambat.
- Seed boleh menggunakan konten prototipe, tetapi harus jelas berlabel demo dan tidak boleh dipakai sebagai klaim production.
