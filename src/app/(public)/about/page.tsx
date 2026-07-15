import type { Metadata } from "next";
import { Compass, HeartHandshake, Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { getStorefrontSettings } from "@/lib/repositories/storefront.repository";

import { InformationPage } from "../_components/information-page";

export const metadata: Metadata = { title: "Tentang Toko", description: "Kenali NusaMart dan cara kami membantu Anda menemukan produk pilihan.", alternates: { canonical: "/about" } };

export default async function AboutPage() {
  const settings = await getStorefrontSettings();
  return <InformationPage description={settings.description ?? "Produk pilihan untuk kebutuhan harian dan gaya hidup modern."} eyebrow="Tentang Kami" title={`${settings.store_name}, pilihan yang dibuat lebih sederhana.`}>
    <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr]"><article className="prose prose-neutral max-w-none"><h2 className="font-serif text-3xl">Toko untuk kebutuhan yang beragam</h2><p className="mt-4 text-sm leading-8 text-muted-foreground">{settings.store_name} hadir sebagai toko general-purpose untuk membantu pengunjung menemukan kebutuhan harian dan pelengkap gaya hidup dalam satu katalog yang mudah dijelajahi. Setiap produk menampilkan harga, stok, dan cara membeli yang telah dikonfigurasi oleh toko.</p><p className="mt-4 text-sm leading-8 text-muted-foreground">Kami menjaga pengalaman belanja tetap praktis: Anda dapat mencari produk, menyaring kategori, membuka detail, lalu melanjutkan melalui WhatsApp, tautan pilihan, atau keranjang sesuai jenis produknya.</p></article><Card className="bg-primary text-primary-foreground"><CardContent className="p-7"><p className="text-sm text-white/65">Tagline kami</p><blockquote className="mt-3 font-serif text-3xl leading-tight">“{settings.tagline ?? "Pilihan Tepat, Hidup Lebih Hebat"}”</blockquote></CardContent></Card></div>
    <div className="mt-12 grid gap-4 md:grid-cols-3">{[[Compass,"Mudah dijelajahi","Kategori, pencarian, dan filter membantu mempersempit pilihan."],[Sparkles,"Informasi ringkas","Detail penting ditempatkan dekat dengan tindakan beli."],[HeartHandshake,"Cara beli fleksibel","Tujuan beli mengikuti konfigurasi setiap produk."]].map(([Icon,title,copy]) => <Card key={String(title)}><CardContent className="p-6"><Icon aria-hidden="true" className="size-6 text-primary" /><h2 className="mt-4 font-bold">{String(title)}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{String(copy)}</p></CardContent></Card>)}</div>
  </InformationPage>;
}
