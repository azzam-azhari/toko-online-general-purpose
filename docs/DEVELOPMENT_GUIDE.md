# Panduan Pengembangan

## 1. Prasyarat

- Node.js sesuai requirement package.
- Package manager sesuai lockfile.
- Supabase project atau Supabase CLI.
- Akun Midtrans Sandbox.

## 2. Setup

```bash
git clone <repository>
cd <repository>
cp env.example .env.local
npm install
npm run dev
```

Sesuaikan perintah dengan package manager proyek.

## 3. Workflow Branch

Contoh:

- `main`: production.
- `develop`: integration.
- `feature/<name>`.
- `fix/<name>`.
- `chore/<name>`.

## 4. Workflow Fitur

1. Baca dokumentasi domain.
2. Buat atau ubah schema Zod.
3. Buat tipe domain.
4. Buat migration bila ada perubahan database.
5. Buat repository/service.
6. Buat Server Action/Route Handler.
7. Buat UI.
8. Tambahkan test.
9. Perbarui dokumentasi.

## 5. Coding Standard

- Strict TypeScript.
- Hindari `any`.
- Function kecil dan fokus.
- Error terstruktur.
- Tidak ada secret di client.
- Server Component default.
- Gunakan `use client` hanya bila perlu.
- Hindari query database tersebar di component.

## 6. Form

- React Hook Form.
- Zod resolver.
- Server validation tetap wajib.
- Field error ditampilkan dekat input.
- Submit button memiliki pending state.
- Mencegah double-submit.

## 7. Data Table

- TanStack Table.
- Pagination server-side untuk data besar.
- Filter dan sorting dikonversi ke query.
- Action menu hanya aktif untuk session admin yang valid.

## 8. Commit

Contoh Conventional Commits:

```text
feat(products): add configurable CTA
fix(payment): reject invalid webhook signature
docs(database): document product indexes
```

## 9. Review Checklist

- Sesuai requirement.
- Tidak ada breaking change tersembunyi.
- RLS/authorization diuji.
- Loading/error state tersedia.
- Query efisien.
- Test relevan.
- Dokumentasi diperbarui.
