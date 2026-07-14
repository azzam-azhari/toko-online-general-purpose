# Integrasi WhatsApp

## 1. Tujuan

CTA WhatsApp membuka percakapan ke nomor toko dengan pesan yang dibentuk dari data produk.

## 2. Normalisasi Nomor

Aturan Indonesia:

- Hapus spasi, `+`, `-`, dan karakter non-digit.
- Nomor `08...` diubah menjadi `628...`.
- Nomor `8...` dapat diubah menjadi `628...` bila konfigurasi negara Indonesia.
- Nomor `62...` dipertahankan.
- Tolak nomor yang terlalu pendek atau tidak valid.

Contoh:

```ts
export function normalizeWhatsAppNumber(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}
```

Tambahkan validasi panjang dan kode negara sesuai kebutuhan.

## 3. Template

Placeholder yang didukung:

- `{product_name}`
- `{product_price}`
- `{product_url}`
- `{product_sku}`
- `{store_name}`

Nilai `{store_name}` diambil dari profil toko pada `store_settings`, dengan environment hanya sebagai fallback saat pengaturan belum tersedia.

Contoh:

```text
Halo, saya tertarik membeli produk {product_name} dengan harga {product_price}. Detail: {product_url}
```

## 4. URL

```text
https://wa.me/{normalized_number}?text={encoded_message}
```

Selalu gunakan `encodeURIComponent` untuk pesan.

## 5. Prioritas Konfigurasi

1. Nomor khusus produk.
2. Nomor default pengaturan toko.
3. Environment `NEXT_PUBLIC_DEFAULT_WHATSAPP_NUMBER`.

## 6. Validasi

- CTA WhatsApp tidak aktif bila nomor tidak tersedia.
- Template kosong menggunakan default.
- Data produk harus berasal dari server-rendered data tepercaya.
- URL produk dibentuk dari `NEXT_PUBLIC_APP_URL`.

## 7. Analytics

Catat event tanpa menyimpan isi pesan sensitif:

- product ID,
- timestamp,
- source page,
- CTA type.

Jangan mengirim nomor pelanggan karena pelanggan belum memberikan nomor pada tahap deep link.
