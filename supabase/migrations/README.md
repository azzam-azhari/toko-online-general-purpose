# Supabase Migrations

Migration dijalankan berdasarkan 14 digit timestamp pada nama file. Urutan domain Fase 2:

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
11. storage buckets dan policies.

Perubahan schema, index, trigger, grant, atau policy baru harus dibuat sebagai migration baru; jangan mengubah migration yang sudah pernah diterapkan ke staging/production. Data development tetap berada di `supabase/seed.sql` agar tidak menjadi bagian dari deployment production.

