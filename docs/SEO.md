# SEO

## 1. Metadata

Gunakan Next.js Metadata API untuk:

- title,
- description,
- canonical,
- Open Graph,
- Twitter card,
- robots.

Template title:

```text
{pageTitle} | {storeName}
```

`storeName` dan metadata identitas dasar berasal dari `store_settings` agar perubahan nama toko oleh admin langsung konsisten pada halaman publik.

## 2. Halaman Produk

Metadata dihasilkan dari produk:

- `seo_title` atau nama produk.
- `seo_description` atau short description.
- canonical berdasarkan slug.
- primary image untuk Open Graph.

Produk nonaktif atau dihapus harus mengembalikan 404 atau `noindex`.

## 3. Structured Data

Gunakan JSON-LD:

- `Organization`
- `WebSite`
- `BreadcrumbList`
- `Product`
- `FAQPage`

Data harga dan availability harus sesuai database.

## 4. Sitemap

Sitemap mencakup:

- halaman publik,
- produk aktif,
- kategori aktif.

Jangan memasukkan:

- dashboard,
- auth,
- order pribadi,
- preview draft.

## 5. Robots

Blokir crawling:

```text
/dashboard/
/api/
/login/
/order/
```

Atur lebih tepat sesuai kebutuhan.

## 6. Slug

- lowercase,
- kebab-case,
- unik,
- stabil,
- redirect bila slug berubah pada fase lanjutan.

## 7. Performa

SEO teknis bergantung pada:

- Core Web Vitals,
- ukuran gambar,
- caching,
- semantic HTML,
- internal linking,
- server rendering.

## 8. Konten

- Hindari deskripsi duplikat.
- Gunakan heading terstruktur.
- Pastikan kategori memiliki intro yang berguna.
- Alt text menjelaskan gambar.
