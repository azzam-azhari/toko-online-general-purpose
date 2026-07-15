"use client";

import { Loader2, PackageSearch, Save, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { updateOperationalSettingsAction } from "@/actions/operations.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StoreSettings } from "@/types/operations";

export function OperationalSettingsForm({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    const result = await updateOperationalSettingsAction(new FormData(event.currentTarget));
    setPending(false);
    if (!result.ok) {
      setErrors(result.error.fieldErrors ?? {});
      toast.error(result.error.message);
      return;
    }
    toast.success("Pengaturan toko berhasil disimpan.");
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><PackageSearch aria-hidden="true" /></span>
            <div><CardTitle className="font-sans text-xl">Persediaan</CardTitle><CardDescription>Tentukan kapan produk masuk ke laporan stok rendah.</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent className="max-w-md">
          <Label htmlFor="settings-low-stock">Batas stok rendah</Label>
          <Input defaultValue={settings.low_stock_threshold} id="settings-low-stock" min="0" name="low_stock_threshold" type="number" />
          <p className="mt-1 text-xs text-muted-foreground">Produk dengan stok tersedia sejumlah nilai ini atau kurang akan ditandai untuk diperiksa.</p>
          {errors.low_stock_threshold?.[0] ? <p className="mt-1 text-sm text-destructive">{errors.low_stock_threshold[0]}</p> : null}
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="font-sans text-xl">Wilayah Operasional</CardTitle><CardDescription>Nilai ini dikunci sesuai cakupan toko saat ini.</CardDescription></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border bg-secondary/50 p-4"><span className="text-xs font-semibold text-muted-foreground">Mata uang</span><strong className="mt-1 block">IDR — Rupiah</strong></div>
            <div className="rounded-lg border bg-secondary/50 p-4"><span className="text-xs font-semibold text-muted-foreground">Zona waktu</span><strong className="mt-1 block">Asia/Jakarta</strong></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Truck aria-hidden="true" /></span>
              <div><CardTitle className="font-sans text-xl">Pengiriman & Pembelian</CardTitle><CardDescription>Konfigurasi kanal transaksi yang sedang berlaku.</CardDescription></div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3 rounded-lg border p-3"><span>Ongkir tetap</span><strong>Rp {settings.flat_shipping_fee.toLocaleString("id-ID")}</strong></div>
            <div className="rounded-lg border bg-secondary/50 p-3 text-muted-foreground">Kanal aktif: WhatsApp dan tautan eksternal. Pembayaran Midtrans belum diaktifkan.</div>
          </CardContent>
        </Card>
      </div>

      <div className="sticky bottom-3 z-20 flex flex-col gap-3 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">Terakhir disimpan {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(settings.updated_at))}</p>
        <Button disabled={pending} type="submit">{pending ? <Loader2 aria-hidden="true" className="animate-spin" /> : <Save aria-hidden="true" />}Simpan Pengaturan</Button>
      </div>
    </form>
  );
}
