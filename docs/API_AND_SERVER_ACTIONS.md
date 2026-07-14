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
archiveProductAction(id)
setProductStatusAction(id, status)
createCategoryAction(input)
updateCategoryAction(id, input)
updateOrderStatusAction(id, status)
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

## 3. Route Handlers

### `POST /api/checkout/midtrans`

Request:

```json
{
  "items": [
    { "productId": "uuid", "quantity": 2 }
  ],
  "customer": {
    "name": "Nama",
    "email": "email@example.com",
    "phone": "628123456789"
  }
}
```

Server harus mengambil harga produk dari database. Jangan menggunakan harga client.

Response:

```json
{
  "orderNumber": "ORD-20260714-ABC123",
  "snapToken": "...",
  "redirectUrl": "..."
}
```

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
