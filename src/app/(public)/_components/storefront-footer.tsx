import { Camera, Mail, MapPin, Phone, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getPublicAssetUrl } from "@/lib/storefront";
import type { StorefrontSettings } from "@/types/storefront";

export function StorefrontFooter({ settings }: { settings: StorefrontSettings }) {
  const logoUrl = getPublicAssetUrl(settings.asset_base_url, "store-assets", settings.logo_path);
  return (
    <footer className="mt-24 border-t bg-[#0d392b] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Link className="inline-flex items-center gap-2.5 font-bold" href="/">
            {logoUrl ? <span className="relative size-9 overflow-hidden rounded-xl bg-white"><Image alt={`Logo ${settings.store_name}`} className="object-contain" fill sizes="36px" src={logoUrl} /></span> : <span className="grid size-9 place-items-center rounded-xl bg-[#f2b84b] font-serif text-lg text-[#0d392b]">{settings.store_name.slice(0, 1).toUpperCase()}</span>}
            <span className="text-lg">{settings.store_name}</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-7 text-white/65">
            {settings.description ?? "Produk pilihan untuk kebutuhan harian dan gaya hidup modern."}
          </p>
          <div className="mt-5 flex gap-2">
            {settings.facebook_url ? (
              <Button asChild className="border-white/15 text-white hover:bg-white/10" size="icon" variant="outline">
                <a aria-label="Facebook" href={settings.facebook_url} rel="noreferrer" target="_blank"><Share2 aria-hidden="true" /></a>
              </Button>
            ) : null}
            {settings.instagram_url ? (
              <Button asChild className="border-white/15 text-white hover:bg-white/10" size="icon" variant="outline">
                <a aria-label="Instagram" href={settings.instagram_url} rel="noreferrer" target="_blank"><Camera aria-hidden="true" /></a>
              </Button>
            ) : null}
          </div>
        </div>

        <div>
          <h2 className="font-semibold">Belanja</h2>
          <ul className="mt-4 grid gap-3 text-sm text-white/65">
            <li><Link className="hover:text-white" href="/products">Semua Produk</Link></li>
            <li><Link className="hover:text-white" href="/products?sort=latest">Produk Terbaru</Link></li>
            <li><Link className="hover:text-white" href="/products?sort=popular">Produk Pilihan</Link></li>
            {settings.whatsapp_number ? <li><a className="hover:text-white" href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, "").replace(/^0/, "62")}`}>Pesan via WhatsApp</a></li> : null}
          </ul>
        </div>

        <div>
          <h2 className="font-semibold">Informasi</h2>
          <ul className="mt-4 grid gap-3 text-sm text-white/65">
            <li><Link className="hover:text-white" href="/about">Tentang Toko</Link></li>
            <li><Link className="hover:text-white" href="/faq">FAQ</Link></li>
            <li><Link className="hover:text-white" href="/privacy">Kebijakan Privasi</Link></li>
            <li><Link className="hover:text-white" href="/terms">Syarat & Ketentuan</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold">Hubungi Kami</h2>
          <ul className="mt-4 grid gap-4 text-sm text-white/65">
            {settings.contact_email ? <li className="flex gap-3"><Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><a className="hover:text-white" href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a></li> : null}
            {settings.contact_phone ? <li className="flex gap-3"><Phone aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><a className="hover:text-white" href={`tel:${settings.contact_phone}`}>{settings.contact_phone}</a></li> : null}
            {settings.address ? <li className="flex gap-3"><MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><span>{settings.address}</span></li> : null}
            {!settings.contact_email && !settings.contact_phone && !settings.address ? (
              <li>Informasi kontak akan tampil setelah dilengkapi oleh admin.</li>
            ) : null}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} {settings.store_name}. Hak cipta dilindungi.</p>
          <p>{settings.tagline ?? "Pilihan Tepat, Hidup Lebih Hebat"}</p>
        </div>
      </div>
    </footer>
  );
}
