# Keamanan

## 1. Aset yang Dilindungi

- Akun admin.
- Data produk dan harga.
- Data pelanggan dan order.
- Midtrans server key.
- Supabase service role key.
- File upload.
- Activity log.

## 2. Threat Model Ringkas

Ancaman utama:

- privilege escalation,
- IDOR,
- manipulasi harga,
- webhook spoofing,
- XSS dari konten,
- upload berbahaya,
- credential leakage,
- brute force login,
- CSRF pada mutation,
- data scraping/abuse,
- SQL injection melalui query mentah.

## 3. Kontrol

### Authentication

- Supabase Auth.
- Session server-side.
- Rate limit login.
- MFA dapat ditambahkan untuk admin.

### Authorization

- `requireAdmin` pada setiap mutasi dan route dashboard.
- RLS.
- Pemeriksaan admin aktif per action.
- Jangan mempercayai status admin dari client.

### Input

- Zod.
- Sanitasi rich text.
- URL allowlist/protocol validation.
- Batas ukuran request.

### Payment

- Harga dari database.
- Signature verification.
- Constant-time comparison.
- Idempotency.
- Logging webhook.

### Upload

- MIME dan extension validation.
- Random filename.
- Batas ukuran.
- Batasi SVG.
- Storage policy.

### Secret

- Tidak memakai prefix `NEXT_PUBLIC_`.
- Disimpan di secret manager.
- Rotasi bila bocor.
- Jangan dicetak ke log.

## 4. Security Headers

Pertimbangkan:

- Content-Security-Policy.
- X-Content-Type-Options.
- Referrer-Policy.
- Permissions-Policy.
- frame-ancestors melalui CSP.
- HSTS pada production.

CSP perlu mengizinkan domain Midtrans yang benar tanpa terlalu longgar.

## 5. Logging dan Privacy

- Mask email/phone pada log umum.
- Jangan log token, secret, atau full payment payload bila tidak perlu.
- Batasi akses activity log.
- Definisikan retention period.

## 6. Checklist Release

- RLS aktif.
- Tidak ada service key di bundle client.
- Webhook HTTPS.
- Signature test lolos.
- Dependency audit.
- Upload restriction aktif.
- Error tidak membocorkan stack.
- Backup dan rollback tersedia.
