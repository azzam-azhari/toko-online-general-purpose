# Arsitektur Sistem

## 1. Gaya Arsitektur

Aplikasi menggunakan arsitektur modular berbasis Next.js App Router. Server Components menjadi default untuk rendering dan data fetching. Client Components digunakan hanya untuk interaksi browser, form interaktif, chart, dialog, atau state lokal.

```mermaid
flowchart LR
  U[Browser] --> N[Next.js App Router]
  N --> SC[Server Components]
  N --> SA[Server Actions]
  N --> RH[Route Handlers]
  SC --> S[Supabase]
  SA --> S
  RH --> S
  RH --> M[Midtrans API]
  M --> W[Webhook Midtrans]
  W --> RH
  N --> WA[WhatsApp Deep Link]
```

## 2. Lapisan

### Presentation

- `src/app/`
- `src/components/`
- `src/app/_components/`

Tanggung jawab:

- Layout.
- Page.
- UI state.
- Form.
- Table.
- Chart.
- Accessibility.

### Application

- `src/actions/`
- `src/app/api/`
- domain services di `src/lib/`

Tanggung jawab:

- Use case.
- Validasi input.
- Authorization.
- Transaction orchestration.
- Revalidation.
- Integrasi eksternal.

### Domain

- `src/types/`
- `src/validations/`
- `src/constants/`

Tanggung jawab:

- Tipe domain.
- Enum dan status.
- Schema validasi.
- Aturan bisnis yang dapat diuji.

### Infrastructure

- `src/lib/supabase/`
- Midtrans client.
- Storage helper.
- Logger.
- Rate limiter.

Tanggung jawab:

- Database.
- Auth.
- Storage.
- Payment gateway.
- Observability.

## 3. Server dan Client Boundary

Gunakan Server Components untuk:

- Landing page.
- Katalog awal.
- Detail produk.
- Dashboard overview.
- Halaman daftar yang tidak membutuhkan interaksi real-time.

Gunakan Client Components untuk:

- Filter interaktif dengan state client.
- Keranjang.
- Dialog.
- Rich form.
- Grafik Recharts.
- Midtrans Snap client.
- Toast.

Data sensitif tidak boleh dipindahkan ke Client Component melalui props.

## 4. Aliran Data Produk

```mermaid
sequenceDiagram
  participant A as Admin
  participant UI as Product Form
  participant SA as Server Action
  participant DB as Supabase
  participant ST as Storage

  A->>UI: Isi data produk
  UI->>SA: Submit FormData
  SA->>SA: Validasi Zod + authorization
  SA->>ST: Upload gambar
  ST-->>SA: Path publik/private
  SA->>DB: Simpan produk dan gambar
  DB-->>SA: Hasil
  SA->>SA: Catat activity log
  SA-->>UI: Success/error result
```

## 5. Aliran Interaksi Produk Publik

```mermaid
flowchart TD
  C[Kartu Produk] -->|Klik area kartu| D[Detail Produk]
  C -->|Klik tombol Beli| T[Tujuan CTA Produk]
  D --> B[Tombol Beli]
  B --> T
  D --> S[Bagikan Produk]
  S --> CL[Salin Link]
  S --> WA[WhatsApp]
  S --> FB[Facebook]
  S --> IG[Salin Link dan Buka Instagram]
```

Tombol **Beli** di dalam kartu harus menghentikan event navigasi kartu agar langsung menuju CTA. Canonical URL produk digunakan untuk semua aksi berbagi.

## 6. Aliran Checkout Midtrans

```mermaid
sequenceDiagram
  participant B as Browser
  participant API as Next Route Handler
  participant DB as Supabase
  participant MT as Midtrans

  B->>API: POST /api/checkout/midtrans
  API->>DB: Ambil produk dan hitung ulang nominal
  API->>DB: Buat order pending
  API->>MT: Buat Snap transaction
  MT-->>API: token dan redirect URL
  API->>DB: Simpan payment transaction
  API-->>B: token Snap
  MT->>API: Webhook
  API->>API: Verifikasi signature
  API->>DB: Update payment + order idempotent
```

## 7. Data Fetching

- Server-side read menggunakan Supabase server client.
- Client-side read yang memerlukan refresh interaktif menggunakan TanStack Query.
- Mutation dapat menggunakan Server Actions atau Route Handlers.
- Setelah mutation, gunakan `revalidatePath`, `revalidateTag`, atau invalidasi query.
- Jangan menyimpan server state utama di Zustand.

## 8. Error Handling

Gunakan bentuk hasil yang konsisten:

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; fieldErrors?: Record<string, string[]> } };
```

Kategori error:

- `VALIDATION_ERROR`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `CONFLICT`
- `RATE_LIMITED`
- `EXTERNAL_SERVICE_ERROR`
- `INTERNAL_ERROR`

Detail internal dicatat di server tetapi tidak dikirim ke pengguna.

## 9. Caching

- Cache katalog yang stabil dengan tag.
- Jangan cache data session atau halaman dashboard secara publik.
- Revalidate tag produk setelah perubahan produk.
- Revalidate tag kategori setelah perubahan kategori.
- Revalidate halaman dan tag pengaturan toko setelah admin mengubah profil website.
- Jangan cache respons webhook.

## 10. Observability

- Structured logging.
- Request/correlation ID.
- Error monitoring.
- Audit log database.
- Metric minimum: checkout created, payment success, payment failure, webhook rejected.
