# Integrasi Midtrans

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
4. Hitung subtotal di server.
5. Buat `orders`.
6. Buat `order_items`.
7. Panggil Midtrans Snap API.
8. Simpan `payment_transactions`.
9. Kembalikan Snap token.

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
| refund | refunded | cancelled atau status bisnis khusus |

Mapping final harus mempertimbangkan `fraud_status` dan jenis payment.

## 7. Idempotency

Sebelum update:

- Ambil transaksi berdasarkan `provider_order_id`.
- Bandingkan status terakhir.
- Hindari menurunkan status final ke status lama.
- Simpan notification payload untuk audit.
- Gunakan transaction database bila update lebih dari satu tabel.

## 8. Stock Strategy

Pilihan tahap awal:

- Stok dikurangi setelah payment `paid`.
- Sebelum checkout, sistem hanya memvalidasi ketersediaan.
- Risiko overselling ditangani dengan lock/reservation pada fase lanjut.

Alternatif lebih aman untuk volume tinggi adalah reservasi stok dengan expiry.

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
