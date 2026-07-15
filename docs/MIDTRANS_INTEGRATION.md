# Integrasi Midtrans

> Status Fase 8 saat ini: **belum diaktifkan**. Kanal production dibatasi ke WhatsApp dan tautan eksternal. Dokumen ini tetap menjadi rancangan aktivasi lanjutan setelah seluruh pengujian sandbox dan UAT memiliki persetujuan tertulis.

## 1. Mode

Gunakan environment terpisah:

- Sandbox untuk development/staging.
- Production hanya setelah UAT.

```env
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
MIDTRANS_SERVER_KEY=
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_NOTIFICATION_URL=
```

## 2. Prinsip Keamanan

- Server key hanya ada di server.
- Nominal dihitung ulang dari database.
- SKU, nama, dan harga order disnapshot.
- Signature webhook diverifikasi.
- Webhook diproses idempotent.
- Status client tidak menjadi sumber kebenaran pembayaran.

## 3. Create Transaction

1. Validasi customer dan item.
2. Ambil produk aktif dari database.
3. Validasi stok.
4. Hitung subtotal dan ongkir tetap di server.
5. Dalam transaksi database, kunci produk, buat `orders` dan `order_items`, lalu tambah `reserved_stock`.
6. Panggil Midtrans Snap API dengan idempotency key.
7. Simpan `payment_transactions`.
8. Kembalikan Snap token dan waktu kedaluwarsa.
9. Bila Snap gagal, batalkan order dan lepaskan reservasi secara idempotent.

## 4. Order Number

Format contoh:

```text
ORD-YYYYMMDD-RANDOM
```

Order number harus unik dan sulit ditebak secara berurutan.

## 5. Webhook Signature

Konsep signature Midtrans:

```text
SHA512(order_id + status_code + gross_amount + server_key)
```

Bandingkan menggunakan constant-time comparison.

## 6. Mapping Status

| Midtrans | Payment Status | Order Status |
|---|---|---|
| settlement | paid | confirmed |
| capture + accept | paid | confirmed |
| pending | pending | pending |
| deny | failed | pending/cancelled |
| cancel | failed | cancelled |
| expire | expired | cancelled |
| refund | refunded | cancelled bila belum diproses; selain itu rekonsiliasi admin |

Mapping final harus mempertimbangkan `fraud_status` dan jenis payment.

## 7. Idempotency

Sebelum update:

- Ambil transaksi berdasarkan `provider_order_id`.
- Bandingkan status terakhir.
- Hindari menurunkan status final ke status lama.
- Simpan notification payload untuk audit.
- Gunakan transaction database bila update lebih dari satu tabel.

## 8. Stock Strategy

- `stock` menyimpan jumlah fisik dan `reserved_stock` menyimpan jumlah yang ditahan.
- Stok tersedia adalah `stock - reserved_stock`.
- Buat reservasi atomik selama 30 menit sebelum token Snap dikirim.
- Saat pembayaran `paid`, kurangi `stock` dan `reserved_stock` dalam transaksi yang sama.
- Saat `deny`, `cancel`, atau `expire`, lepaskan `reserved_stock` tanpa mengubah `stock`.
- Cleanup terjadwal melepas reservasi kedaluwarsa secara idempotent.
- Pembayaran terlambat setelah reservasi dilepas masuk rekonsiliasi admin bila stok tidak lagi cukup; sistem tidak boleh membuat stok negatif.

## 9. Client Integration

Client hanya menerima:

- Snap token.
- Redirect URL.
- Order number.

Setelah popup selesai, client tetap memeriksa status order dari server.

## 10. Testing

Uji:

- settlement,
- pending,
- deny,
- expire,
- duplicate notification,
- signature invalid,
- nominal dimanipulasi,
- item tidak aktif,
- stok tidak cukup,
- timeout dari Midtrans.
