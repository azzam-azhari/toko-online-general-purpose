# API dan Server Actions

## 1. Pemilihan Mekanisme

Gunakan Server Actions untuk:

- Form dashboard.
- Mutation yang dipanggil langsung dari UI Next.js.
- Revalidation route/tag.

Gunakan Route Handlers untuk:

- Webhook.
- Endpoint publik yang dipanggil sistem eksternal.
- Endpoint checkout yang membutuhkan respons JSON.
- Health check.
- Upload multipart bila lebih cocok.

## 2. Server Actions

Daftar awal:

```ts
createProductAction(input)
updateProductAction(id, input)
deleteProductAction(id)
setProductStatusAction(id, status)
createCategoryAction(input)
updateCategoryAction(id, input)
deleteCategoryAction(id)
updateOrderStatusAction(id, status)
createExternalOrderAction(input)
updateExternalPaymentStatusAction(input)
updateStoreSettingsAction(input)
updateStoreProfileAction(input)
createBannerAction(input)
```

Setiap action harus:

1. Memvalidasi session.
2. Memvalidasi bahwa session berasal dari admin aktif.
3. Memvalidasi input dengan Zod.
4. Menjalankan operasi database.
5. Menulis activity log.
6. Melakukan revalidation.
7. Mengembalikan `ActionResult`.

`deleteProductAction` dan `deleteCategoryAction` memanggil RPC hard-delete transaksional. Setelah database mengembalikan path gambar, action membersihkan bucket Storage dengan service role server-only dan mengembalikan `warning` bila cleanup eksternal belum dapat diverifikasi.

## 3. Route Handlers

### `POST /api/checkout/midtrans`

Request:

```json
{
  "idempotencyKey": "uuid",
  "items": [
    { "productId": "uuid", "quantity": 2 }
  ],
  "customer": {
    "name": "Nama",
    "email": "email@example.com",
    "phone": "628123456789",
    "address": {
      "line1": "Nama jalan dan nomor",
      "line2": "Patokan atau unit",
      "city": "Kota",
      "province": "Provinsi",
      "postalCode": "12345"
    }
  }
}
```

Server harus mengambil harga produk dari database. Jangan menggunakan harga client.

Response:

```json
{
  "orderNumber": "ORD-20260714-ABC123",
  "snapToken": "...",
  "redirectUrl": "...",
  "expiresAt": "2026-07-15T12:30:00.000Z"
}
```

Endpoint ini hanya menerima produk aktif dengan `cta_type = 'midtrans'`. Server wajib menghitung harga dan ongkir, mengunci stok, membuat order, serta mereservasi stok secara atomik. `idempotencyKey` yang sama mengembalikan order yang sama dan tidak boleh membuat reservasi kedua.

### `POST /api/midtrans/webhook`

- Tanpa session.
- Wajib verifikasi signature.
- Wajib idempotent.
- Jangan mengembalikan data sensitif.

### `GET /api/health`

Response minimum:

```json
{
  "status": "ok"
}
```

### `GET /api/health/ready`

Memeriksa koneksi database untuk monitoring production. Respons hanya `ready` atau `degraded`, memakai `no-store`, dan tidak mengembalikan detail database.

### `POST /api/orders/status`

- Menerima `order_number` dan `contact` (email atau telepon).
- Rate limited per IP.
- Pencocokan contact dilakukan server-side.
- Respons tidak mengembalikan nama, email, telepon, alamat, payment payload, atau data internal.
- Error pesanan tidak ada dan contact tidak cocok menggunakan pesan generik.

## 4. Zod

Pisahkan schema:

```text
validations/
├── auth.schema.ts
├── product.schema.ts
├── category.schema.ts
├── checkout.schema.ts
├── order.schema.ts
└── settings.schema.ts
```

## 5. Idempotency

Gunakan identifier unik untuk operasi pembayaran:

- `order_number` unik.
- `idempotency_key` unik per checkout.
- `provider_order_id` unik per provider.
- Webhook update berdasarkan status terakhir.
- Jangan menduplikasi transaksi ketika client retry.

## 6. Rate Limiting

Prioritaskan:

- login,
- checkout,
- order lookup,
- webhook invalid,
- contact form.

## 7. Response Security

- Jangan mengirim stack trace.
- Jangan mengirim service role key.
- Jangan mengirim raw Midtrans response ke client.
- Sanitasi error message dari layanan eksternal.
