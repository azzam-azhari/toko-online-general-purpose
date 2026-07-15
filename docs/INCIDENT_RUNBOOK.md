# Runbook Insiden Production

## 1. Tujuan

Runbook ini digunakan untuk gangguan storefront, database, autentikasi, order eksternal, payment ledger, Storage, dan deployment. Prioritas pertama adalah melindungi data pelanggan dan mencegah perubahan stok/order yang salah.

## 2. Severity

| Level | Contoh | Respons awal |
|---|---|---:|
| SEV-1 | Situs tidak dapat diakses, kebocoran secret/data, order atau stok korup massal | 15 menit |
| SEV-2 | Pencatatan order/payment gagal, login admin gagal, database degraded | 30 menit |
| SEV-3 | Fitur non-kritis terganggu, satu order perlu rekonsiliasi | 4 jam kerja |

## 3. Peran

- Incident commander: mengatur prioritas, keputusan, dan komunikasi.
- Operator aplikasi: memeriksa Vercel, deployment, env, dan log Next.js.
- Operator database: memeriksa Supabase, migration, RLS, koneksi, dan backup.
- Pemilik produk: menyetujui perubahan bisnis, maintenance, atau komunikasi pelanggan.

Satu orang dapat memegang lebih dari satu peran, tetapi setiap tindakan dan waktu harus dicatat pada issue insiden.

## 4. Respons Awal

1. Buka issue insiden dan catat waktu, gejala, URL, deployment, serta dampak.
2. Tentukan severity dan incident commander.
3. Periksa `/api/health` lalu `/api/health/ready`.
4. Periksa deployment terakhir, perubahan env, migration, error log, status Supabase, dan koneksi.
5. Hentikan perubahan production lain sampai insiden stabil.
6. Bila ada risiko transaksi/stok salah, minta admin menghentikan update payment/order sementara.
7. Jangan menyalin service key, database URL, kontak pelanggan, atau payload sensitif ke issue/log.

## 5. Skenario

### Aplikasi 5xx atau tidak dapat diakses

1. Bandingkan liveness dan readiness.
2. Bila liveness gagal tetapi Supabase sehat, rollback deployment Vercel ke versi terakhir yang sehat.
3. Bila readiness gagal, jangan melakukan retry mutasi massal; lanjut ke skenario database.
4. Jalankan smoke test landing, katalog, detail, login, order list, dan status lookup setelah recovery.

### Database tidak siap

1. Periksa status project, koneksi, disk, locks, dan log PostgreSQL di Supabase.
2. Verifikasi database URL/keys belum berubah atau kedaluwarsa.
3. Hentikan migration baru.
4. Untuk migration gagal, utamakan forward fix yang telah diuji pada clone/staging.
5. Restore backup hanya bila forward fix/rollback aplikasi tidak cukup dan pemilik production menyetujui.

### Order atau payment duplikat

1. Jangan menghapus order/payment.
2. Bandingkan `idempotency_key`, `order_number`, activity log, dan waktu transaksi.
3. Tandai order yang meragukan untuk rekonsiliasi.
4. Koreksi melalui fungsi/admin flow yang diaudit; jangan menjalankan update SQL ad-hoc tanpa backup dan review.

### Stok tidak sesuai

1. Tahan fulfillment order terkait.
2. Periksa order items snapshot, payment history, activity log, dan stok fisik.
3. Order `reconciliation_required` tidak boleh diproses sampai keputusan dicatat.
4. Koreksi stok dengan alasan dan activity log; jangan membuat stok negatif.

### Secret bocor

1. Jadikan SEV-1.
2. Rotasi secret terkait segera: service role, database password, deploy hook, dan provider keys yang terdampak.
3. Perbarui Vercel/GitHub secret, deploy ulang, lalu cabut nilai lama.
4. Audit log akses dan repository history. Jangan hanya menghapus secret dari commit terbaru.

## 6. Restore Drill

1. Unduh artifact backup yang disetujui.
2. Dekripsi dan ekstrak pada environment operator tepercaya:

   ```bash
   openssl enc -d -aes-256-cbc -pbkdf2 \
     -in production-backup-RUN_ID.tar.gz.enc \
     -out production-backup-RUN_ID.tar.gz \
     -pass env:BACKUP_ENCRYPTION_PASSPHRASE
   tar -xzf production-backup-RUN_ID.tar.gz
   ```

3. Buat project Supabase pemulihan terpisah.
4. Terapkan roles/schema, lalu data.
5. Jalankan verifikasi jumlah tabel, constraint, RLS, row count order/item/payment, dan sampling data.
6. Jalankan smoke test aplikasi terhadap project pemulihan.
7. Catat RPO (umur backup) dan RTO (waktu sampai verifikasi selesai).
8. Hapus project pemulihan dan file lokal sesuai kebijakan retensi.

Production restore memerlukan persetujuan incident commander dan pemilik produk, maintenance window, backup tambahan kondisi terkini, serta rencana komunikasi.

## 7. Recovery dan Penutupan

Insiden dapat ditutup setelah:

- health dan readiness stabil;
- journey terdampak lulus smoke test;
- order/payment/stok yang terdampak telah direkonsiliasi;
- monitoring tidak kembali gagal;
- timeline dan tindakan tercatat;
- follow-up owner dan deadline ditetapkan.

Lakukan post-incident review paling lambat dua hari kerja untuk SEV-1/SEV-2. Fokus pada akar masalah, faktor pendukung, efektivitas deteksi, dampak data, serta tindakan pencegahan yang terukur.
