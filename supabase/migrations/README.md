# Supabase Migrations

Migration dijalankan berdasarkan 14 digit timestamp pada nama file. Urutan domain saat ini:

1. extensions,
2. enums,
3. shared functions,
4. profiles dan trigger Auth,
5. catalog,
6. orders dan payment,
7. content dan store settings,
8. activity logs,
9. indexes,
10. grants dan RLS,
11. storage buckets dan policies,
12. fungsi transaksional katalog, activity log katalog, dan URL publik gambar,
13. trigger Broadcast Supabase Realtime untuk perubahan katalog,
14. dashboard operasional dan timeline order,
15. hardening quality/security,
16. penghapusan katalog permanen,
17. order dan ledger pembayaran eksternal, status publik, serta kesiapan production.

Perubahan schema, index, trigger, grant, atau policy baru harus dibuat sebagai migration baru; jangan mengubah migration yang sudah pernah diterapkan ke staging/production. Data development tetap berada di `supabase/seed.sql` agar tidak menjadi bagian dari deployment production.
