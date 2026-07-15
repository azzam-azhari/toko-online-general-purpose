import type { Metadata } from "next";
import { Camera, Mail, MapPin, MessageCircle, Phone, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getStorefrontSettings } from "@/lib/repositories/storefront.repository";
import { normalizeWhatsAppNumber } from "@/lib/storefront";

import { InformationPage } from "../_components/information-page";

export const metadata: Metadata = { title: "Kontak", description: "Hubungi NusaMart melalui saluran kontak resmi yang tersedia.", alternates: { canonical: "/contact" } };

export default async function ContactPage() {
  const settings = await getStorefrontSettings();
  const whatsapp = normalizeWhatsAppNumber(settings.whatsapp_number ?? "");
  const contacts = [
    settings.contact_email ? { icon: Mail, label: "Email", value: settings.contact_email, href: `mailto:${settings.contact_email}` } : null,
    settings.contact_phone ? { icon: Phone, label: "Telepon", value: settings.contact_phone, href: `tel:${settings.contact_phone}` } : null,
    whatsapp ? { icon: MessageCircle, label: "WhatsApp", value: settings.whatsapp_number!, href: `https://wa.me/${whatsapp}` } : null,
  ].filter(Boolean) as Array<{ icon: typeof Mail; label: string; value: string; href: string }>;
  return <InformationPage description="Gunakan saluran resmi di bawah ini untuk pertanyaan tentang produk atau informasi toko." eyebrow="Kontak" title={`Hubungi ${settings.store_name}.`}>
    {contacts.length ? <div className="grid gap-4 md:grid-cols-3">{contacts.map(({ icon: Icon, label, value, href }) => <Card key={label}><CardContent className="p-6"><span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon aria-hidden="true" className="size-5" /></span><h2 className="mt-4 font-bold">{label}</h2><p className="mt-1 break-all text-sm text-muted-foreground">{value}</p><Button asChild className="mt-5" size="sm" variant="outline"><a href={href} rel="noreferrer" target={label === "WhatsApp" ? "_blank" : undefined}>Hubungi</a></Button></CardContent></Card>)}</div> : <Card className="border-dashed"><CardContent className="p-8 text-center text-sm text-muted-foreground">Informasi kontak belum dilengkapi oleh admin.</CardContent></Card>}
    <div className="mt-8 grid gap-4 md:grid-cols-2">{settings.address ? <Card><CardContent className="p-6"><MapPin aria-hidden="true" className="size-5 text-primary" /><h2 className="mt-4 font-bold">Alamat</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">{settings.address}</p></CardContent></Card> : null}<Card><CardContent className="p-6"><h2 className="font-bold">Media sosial</h2><div className="mt-4 flex gap-2">{settings.facebook_url ? <Button asChild variant="outline"><a href={settings.facebook_url} rel="noreferrer" target="_blank"><Share2 aria-hidden="true" /> Facebook</a></Button> : null}{settings.instagram_url ? <Button asChild variant="outline"><a href={settings.instagram_url} rel="noreferrer" target="_blank"><Camera aria-hidden="true" /> Instagram</a></Button> : null}{!settings.facebook_url && !settings.instagram_url ? <p className="text-sm text-muted-foreground">Tautan media sosial belum tersedia.</p> : null}</div></CardContent></Card></div>
  </InformationPage>;
}
