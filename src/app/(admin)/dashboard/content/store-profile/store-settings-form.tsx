"use client";

import { Loader2, MapPin, Phone, Save, Store } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { updateStoreSettingsAction } from "@/actions/operations.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getPublicAssetUrl } from "@/lib/storefront";
import type { StoreSettings } from "@/types/operations";

function FieldError({ errors, name }: { errors: Record<string, string[]>; name: string }) {
  return errors[name]?.[0] ? <p className="mt-1 text-sm text-destructive">{errors[name][0]}</p> : null;
}

export function StoreSettingsForm({ settings, assetBaseUrl }: { settings: StoreSettings; assetBaseUrl: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [preview, setPreview] = useState({
    store_name: settings.store_name,
    tagline: settings.tagline ?? "",
    description: settings.description ?? "",
    contact_phone: settings.contact_phone ?? "",
    address: settings.address ?? "",
  });
  const logoUrl = useMemo(() => getPublicAssetUrl(assetBaseUrl, "store-assets", settings.logo_path) ?? "/logo/nusamart-logo.png", [assetBaseUrl, settings.logo_path]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setErrors({});
    const result = await updateStoreSettingsAction(new FormData(event.currentTarget));
    setPending(false);
    if (!result.ok) { setErrors(result.error.fieldErrors ?? {}); toast.error(result.error.message); return; }
    toast.success("Profil dan pengaturan toko berhasil disimpan."); router.refresh();
  }

  return (
    <form className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,.85fr)]" onSubmit={submit}>
      <div className="space-y-5">
        <Card><CardHeader><CardTitle className="font-sans text-xl">Identitas</CardTitle><CardDescription>Nama dan tampilan dasar toko pada header, footer, dan metadata.</CardDescription></CardHeader><CardContent className="grid gap-4">
          <div><Label htmlFor="store-name">Nama toko</Label><Input defaultValue={settings.store_name} id="store-name" name="store_name" onChange={(event) => setPreview((state) => ({ ...state, store_name: event.target.value }))} /><FieldError errors={errors} name="store_name" /></div>
          <div><Label htmlFor="store-tagline">Tagline</Label><Input defaultValue={settings.tagline ?? ""} id="store-tagline" name="tagline" onChange={(event) => setPreview((state) => ({ ...state, tagline: event.target.value }))} /><FieldError errors={errors} name="tagline" /></div>
          <div><Label htmlFor="store-description">Deskripsi toko</Label><Textarea defaultValue={settings.description ?? ""} id="store-description" name="description" onChange={(event) => setPreview((state) => ({ ...state, description: event.target.value }))} /><FieldError errors={errors} name="description" /></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="store-logo">Logo</Label><Input accept="image/avif,image/jpeg,image/png,image/webp" id="store-logo" name="logo" type="file" /><p className="mt-1 text-xs text-muted-foreground">Maksimal 5 MB.</p></div><div><Label htmlFor="store-favicon">Favicon</Label><Input accept="image/avif,image/jpeg,image/png,image/webp" id="store-favicon" name="favicon" type="file" /><p className="mt-1 text-xs text-muted-foreground">Gunakan gambar persegi.</p></div></div>
          <input name="existing_logo_path" type="hidden" value={settings.logo_path ?? ""} /><input name="existing_favicon_path" type="hidden" value={settings.favicon_path ?? ""} />
        </CardContent></Card>

        <Card><CardHeader><CardTitle className="font-sans text-xl">Kontak</CardTitle><CardDescription>Informasi yang dapat digunakan pelanggan untuk menghubungi toko.</CardDescription></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="store-email">Email</Label><Input defaultValue={settings.contact_email ?? ""} id="store-email" name="contact_email" type="email" /><FieldError errors={errors} name="contact_email" /></div>
          <div><Label htmlFor="store-phone">Telepon</Label><Input defaultValue={settings.contact_phone ?? ""} id="store-phone" name="contact_phone" onChange={(event) => setPreview((state) => ({ ...state, contact_phone: event.target.value }))} /></div>
          <div className="sm:col-span-2"><Label htmlFor="store-whatsapp">WhatsApp utama</Label><Input defaultValue={settings.whatsapp_number ?? ""} id="store-whatsapp" name="whatsapp_number" placeholder="081234567890" /><p className="mt-1 text-xs text-muted-foreground">Menjadi tujuan fallback produk WhatsApp.</p><FieldError errors={errors} name="whatsapp_number" /></div>
        </CardContent></Card>

        <Card><CardHeader><CardTitle className="font-sans text-xl">Lokasi & Jam Buka</CardTitle></CardHeader><CardContent className="grid gap-4">
          <div><Label htmlFor="store-address">Alamat</Label><Textarea defaultValue={settings.address ?? ""} id="store-address" name="address" onChange={(event) => setPreview((state) => ({ ...state, address: event.target.value }))} /></div>
          <div><Label htmlFor="store-hours">Jam operasional</Label><Input defaultValue={settings.business_hours?.summary ?? ""} id="store-hours" name="business_hours" placeholder="Seninâ€“Jumat, 09.00â€“17.00 WIB" /></div>
        </CardContent></Card>

        <Card><CardHeader><CardTitle className="font-sans text-xl">Media Sosial & SEO Dasar</CardTitle></CardHeader><CardContent className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="store-facebook">Facebook</Label><Input defaultValue={settings.facebook_url ?? ""} id="store-facebook" name="facebook_url" placeholder="https://facebook.com/..." /><FieldError errors={errors} name="facebook_url" /></div><div><Label htmlFor="store-instagram">Instagram</Label><Input defaultValue={settings.instagram_url ?? ""} id="store-instagram" name="instagram_url" placeholder="https://instagram.com/..." /><FieldError errors={errors} name="instagram_url" /></div></div>
          <div><Label htmlFor="store-seo-title">Judul SEO</Label><Input defaultValue={settings.seo_title ?? ""} id="store-seo-title" name="seo_title" /><FieldError errors={errors} name="seo_title" /></div>
          <div><Label htmlFor="store-seo-description">Deskripsi SEO</Label><Textarea defaultValue={settings.seo_description ?? ""} id="store-seo-description" name="seo_description" /><FieldError errors={errors} name="seo_description" /></div>
        </CardContent></Card>

        <Card id="operational-settings"><CardHeader><CardTitle className="font-sans text-xl">Pengaturan Operasional</CardTitle><CardDescription>Untuk Phase 6, metode beli aktif hanya WhatsApp dan tautan eksternal.</CardDescription></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="store-threshold">Batas stok rendah</Label><Input defaultValue={settings.low_stock_threshold} id="store-threshold" min="0" name="low_stock_threshold" type="number" /><FieldError errors={errors} name="low_stock_threshold" /></div>
          <div><Label htmlFor="store-shipping">Ongkir tetap (persiapan Phase 8)</Label><Input defaultValue={settings.flat_shipping_fee} disabled id="store-shipping-display" type="number" /><input name="flat_shipping_fee" type="hidden" value={settings.flat_shipping_fee} /></div>
          <input name="currency" type="hidden" value="IDR" /><input name="timezone" type="hidden" value="Asia/Jakarta" />
          <div className="rounded-lg border bg-secondary/50 p-3 text-sm"><strong>Mata uang</strong><p className="mt-1 text-muted-foreground">IDR â€” Rupiah Indonesia</p></div><div className="rounded-lg border bg-secondary/50 p-3 text-sm"><strong>Zona waktu</strong><p className="mt-1 text-muted-foreground">Asia/Jakarta</p></div>
        </CardContent></Card>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-6 xl:h-fit">
        <Card className="overflow-hidden"><CardHeader><CardTitle className="font-sans text-xl">Pratinjau Sederhana</CardTitle><CardDescription>Gambaran header dan footer storefront.</CardDescription></CardHeader><CardContent className="p-0"><div className="border-y bg-background p-4"><div className="flex items-center gap-3">{logoUrl ? <Image alt="Logo toko saat ini" className="size-10 rounded-xl object-contain" height={40} src={logoUrl} width={40} /> : <span className="grid size-10 place-items-center rounded-xl bg-primary font-serif text-xl text-primary-foreground">{preview.store_name.slice(0,1).toUpperCase() || "N"}</span>}<div><strong className="block">{preview.store_name || "Nama Toko"}</strong><span className="text-xs text-muted-foreground">{preview.tagline || "Tagline toko"}</span></div></div></div><div className="bg-[#0d392b] p-5 text-white"><div className="flex items-center gap-2 font-semibold"><Store aria-hidden="true" className="size-4" />{preview.store_name || "Nama Toko"}</div><p className="mt-3 text-sm leading-6 text-white/65">{preview.description || "Deskripsi toko akan tampil di sini."}</p>{preview.contact_phone ? <p className="mt-3 flex gap-2 text-xs text-white/70"><Phone aria-hidden="true" className="size-4" />{preview.contact_phone}</p> : null}{preview.address ? <p className="mt-2 flex gap-2 text-xs text-white/70"><MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{preview.address}</p> : null}</div></CardContent></Card>
        <Button className="w-full" disabled={pending} size="lg" type="submit">{pending ? <Loader2 aria-hidden="true" className="animate-spin" /> : <Save aria-hidden="true" />}Simpan Perubahan</Button>
        <p className="text-center text-xs text-muted-foreground">Terakhir disimpan {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(settings.updated_at))}</p>
      </aside>
    </form>
  );
}
