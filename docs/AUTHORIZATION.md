# Autentikasi dan Otorisasi

## 1. Role

### `admin`

- Satu-satunya role aplikasi untuk akun internal/dashboard.
- Akses penuh dashboard.
- Mengelola akun admin internal.
- Mengelola konfigurasi kritis.
- Mengakses activity log.
- Mengelola semua domain operasional.
- Tidak ada role internal lain pada scope saat ini.
- Pengunjung publik tidak memiliki role aplikasi dan tidak dapat mengakses dashboard.

## 2. Permission Matrix

| Fitur | Admin |
|---|---:|
| Lihat dashboard | Ya |
| CRUD produk dan kategori | Ya |
| Kelola order | Ya |
| Kelola konten dan profil toko | Ya |
| Kelola pengaturan umum | Ya |
| Kelola akun admin internal | Ya |
| Lihat activity log penuh | Ya |
| Ubah konfigurasi payment | Ya |

## 3. Prinsip Pertahanan Berlapis

1. Proxy/middleware melakukan redirect awal.
2. Server layout dashboard memvalidasi session.
3. Server Action/Route Handler memvalidasi bahwa pengguna adalah admin aktif.
4. RLS membatasi akses database.
5. UI menyembunyikan tindakan yang tidak tersedia, tetapi bukan kontrol keamanan utama.

## 4. Helper Server

```ts
export async function requireUser() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  return user;
}
```

```ts
export async function requireAdmin() {
  const user = await requireUser();
  const profile = await getProfileById(user.id);

  if (!profile?.isActive || profile.role !== "admin") {
    throw new ForbiddenError();
  }

  return profile;
}
```

## 5. Route Protection

- `/dashboard/**`: hanya session dengan profil `admin` aktif.
- `/dashboard/users/**`: hanya session dengan profil `admin` aktif.
- `/dashboard/settings/payment/**`: hanya session dengan profil `admin` aktif.
- `/login`: redirect ke dashboard bila session aktif.

## 6. Profile Provisioning

Buat trigger setelah user Supabase Auth dibuat:

```sql
insert into public.profiles (id, role, is_active)
values (new.id, 'admin', true);
```

Akun admin pertama sebaiknya dibuat melalui migration/SQL manual terkontrol. Pendaftaran publik untuk akun dashboard harus dinonaktifkan; admin tambahan dibuat melalui undangan atau proses internal yang terkontrol.

## 7. Session Rules

- Gunakan Supabase SSR untuk membaca dan refresh cookie.
- Jangan mempercayai status admin dari local storage.
- Jangan hanya menggunakan JWT claim lama tanpa revalidasi untuk operasi sensitif.
- Logout menghapus session dan membersihkan client state.

## 8. Batas Scope Akses

- UI tidak menampilkan pemilih role karena seluruh akun internal adalah `admin`.
- Jangan menambahkan role baru tanpa perubahan kebutuhan produk, threat model, schema, RLS, dan test secara menyeluruh.
- Status `is_active` digunakan untuk menonaktifkan akses akun tanpa menghapus jejak aktivitasnya.
