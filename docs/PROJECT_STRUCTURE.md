# Struktur Proyek

## 1. Struktur Utama

```text
.
├── docs/
├── note/
├── public/
│   ├── flag/
│   └── logo/
├── src/
│   ├── actions/
│   ├── app/
│   │   ├── (admin)/
│   │   ├── (auth)/
│   │   ├── (public)/
│   │   ├── _components/
│   │   └── api/
│   ├── components/
│   │   ├── common/
│   │   └── ui/
│   ├── configs/
│   ├── constants/
│   ├── hooks/
│   ├── lib/
│   │   └── supabase/
│   ├── migrations/
│   ├── providers/
│   ├── stores/
│   ├── types/
│   ├── validations/
│   └── proxy.ts
├── env.example
├── next.config.ts
├── package.json
└── tsconfig.json
```

## 2. Rancangan Route

```text
src/app/
├── (public)/
│   ├── page.tsx
│   ├── products/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── categories/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── cart/page.tsx
│   ├── checkout/page.tsx
│   ├── order/
│   │   ├── status/page.tsx
│   │   └── [orderNumber]/page.tsx
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── faq/page.tsx
│   ├── privacy/page.tsx
│   └── terms/page.tsx
├── (auth)/
│   ├── login/page.tsx
│   ├── forgot-password/page.tsx
│   └── reset-password/page.tsx
├── (admin)/
│   └── dashboard/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── products/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/edit/page.tsx
│       ├── categories/
│       ├── orders/
│       ├── content/
│       │   ├── store-profile/
│       │   ├── banners/
│       │   ├── testimonials/
│       │   └── faqs/
│       ├── settings/
│       ├── users/
│       └── activity/
├── api/
│   ├── checkout/midtrans/route.ts
│   ├── midtrans/webhook/route.ts
│   ├── upload/route.ts
│   └── health/route.ts
├── error.tsx
├── global-error.tsx
├── loading.tsx
├── not-found.tsx
├── robots.ts
└── sitemap.ts
```

## 3. Penempatan Kode

### `src/actions/`

Kelompokkan berdasarkan domain:

```text
actions/
├── auth.actions.ts
├── products.actions.ts
├── categories.actions.ts
├── orders.actions.ts
├── content.actions.ts
├── settings.actions.ts
├── store-profile.actions.ts
└── storage.actions.ts
```

### `src/components/common/`

```text
components/common/
├── data-table/
├── empty-state/
├── error-state/
├── image-uploader/
├── page-header/
├── price/
├── product-card/
├── responsive-dialog/
├── status-badge/
└── theme-toggle/
```

### `src/lib/`

```text
lib/
├── supabase/
│   ├── client.ts
│   ├── server.ts
│   ├── service.ts
│   └── middleware.ts
├── midtrans/
│   ├── client.ts
│   ├── signature.ts
│   └── status-map.ts
├── auth/
│   ├── require-user.ts
│   └── require-admin.ts
├── repositories/
├── services/
├── logger.ts
├── money.ts
├── slug.ts
└── whatsapp.ts
```

## 4. Konvensi

- File React component: `kebab-case.tsx`.
- Exported component: `PascalCase`.
- Function: `camelCase`.
- Constant: `UPPER_SNAKE_CASE`.
- Database column: `snake_case`.
- Route slug: `kebab-case`.
- Zod schema: `productCreateSchema`.
- Type: `Product`, `ProductCreateInput`.
- Server Action: `createProductAction`.

## 5. Import Boundary

- UI boleh mengimpor domain type.
- Domain tidak boleh mengimpor UI.
- Client Component tidak boleh mengimpor server-only module.
- Service role Supabase client hanya boleh ada pada module berlabel `server-only`; istilah ini adalah nama key Supabase, bukan role pengguna aplikasi.
- Repository mengakses database; component tidak melakukan query kompleks langsung.
