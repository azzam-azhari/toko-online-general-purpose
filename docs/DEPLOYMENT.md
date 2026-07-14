# Deployment

## 1. Environment

Gunakan:

- development,
- staging,
- production.

Masing-masing memiliki Supabase dan konfigurasi Midtrans terpisah.

## 2. Pre-Deployment

- Typecheck.
- Lint.
- Test.
- Build.
- Review env.
- Review migration.
- Backup database.
- Verifikasi redirect URL Supabase.
- Verifikasi webhook Midtrans.

## 3. Database Migration

Urutan:

1. Backup.
2. Jalankan migration di staging.
3. Uji smoke test.
4. Jalankan migration production.
5. Deploy aplikasi yang kompatibel.
6. Monitor error.

Untuk perubahan breaking, gunakan strategi expand-and-contract.

## 4. Application

Platform dapat berupa Vercel atau platform Node.js lain yang kompatibel dengan Next.js.

Pastikan:

- HTTPS.
- environment variable.
- serverless timeout cukup untuk checkout.
- region dekat database.
- logging aktif.
- domain dikonfigurasi.

## 5. Midtrans

- Notification URL menggunakan HTTPS production.
- Client key dan server key sesuai environment.
- Uji webhook dari dashboard Midtrans.
- Jangan memakai Sandbox key pada production.

## 6. Supabase

- Redirect URL production.
- RLS aktif.
- Storage policy aktif.
- Backup.
- Connection limit dipantau.

## 7. Smoke Test

- landing page.
- katalog.
- detail produk.
- login.
- dashboard.
- create product.
- upload image.
- checkout sandbox/production test kecil.
- webhook.
- status order.

## 8. Rollback

Aplikasi:

- rollback ke deployment sebelumnya.

Database:

- hindari destructive migration langsung,
- gunakan forward fix bila memungkinkan,
- restore backup hanya saat perlu.

## 9. Monitoring

Monitor:

- 5xx.
- latency.
- checkout failure.
- webhook rejection.
- database error.
- storage error.
- auth failure.
