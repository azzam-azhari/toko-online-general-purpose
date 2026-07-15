# Rekonsiliasi Baseline Migration Production

Project Supabase production telah memiliki schema aplikasi, tetapi pemeriksaan read-only pada 15 Juli 2026 menunjukkan tabel `supabase_migrations.schema_migrations` belum mencatat migration lokal `20260715010001` sampai `20260715010016`. Karena itu, menjalankan `db push --include-all` berisiko mencoba membuat ulang objek yang sudah ada.

Jangan menerapkan migration Fase 8 sebelum baseline direkonsiliasi.

## Prasyarat

- Backup schema, roles, dan data berhasil serta dapat didekripsi.
- UAT staging disetujui tertulis.
- Operator memiliki database URL production yang percent-encoded.
- Schema production telah dibandingkan terhadap migration 001–016.
- Perbedaan schema telah ditinjau; jangan menandai migration sebagai applied hanya berdasarkan nama tabel.

## Verifikasi Read-only

```bash
npx supabase migration list --db-url "$SUPABASE_PRODUCTION_DB_URL" --output json
npx supabase db lint --db-url "$SUPABASE_PRODUCTION_DB_URL" --level warning
```

Verifikasi minimal:

- seluruh tabel, enum, constraint, index, trigger, fungsi, grant, RLS, dan Storage policy 001–016 tersedia;
- fungsi deletion dan hardening Fase 7 sesuai source;
- tidak ada transaksi payment provider non-eksternal;
- lint tidak memiliki error; warning yang ada memiliki rencana perbaikan.

## Repair History

Setelah schema diverifikasi oleh dua reviewer, tandai baseline sebagai applied tanpa menjalankan ulang SQL:

```bash
npx supabase migration repair --db-url "$SUPABASE_PRODUCTION_DB_URL" --status applied \
  20260715010001 20260715010002 20260715010003 20260715010004 \
  20260715010005 20260715010006 20260715010007 20260715010008 \
  20260715010009 20260715010010 20260715010011 20260715010012 \
  20260715010013 20260715010014 20260715010015 20260715010016
```

Jalankan kembali `migration list`. Kolom remote untuk 001–016 harus terisi, sedangkan 017 tetap pending. Simpan output pada bukti release.

## Apply Fase 8

Gunakan workflow **Production Release**. Workflow sengaja gagal bila baseline 001–016 belum tercatat. Workflow membuat backup lagi, menjalankan dry-run, menerapkan hanya migration pending, memicu deploy Vercel, lalu menjalankan smoke test.

Jangan menggunakan `--include-all` pada production ini.
