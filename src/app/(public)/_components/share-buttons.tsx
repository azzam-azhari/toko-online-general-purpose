"use client";

import { Camera, Clipboard, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

async function copyLink(url: string) {
  await navigator.clipboard.writeText(url);
}

export function ShareButtons({ productName, url, instagramUrl }: { productName: string; url: string; instagramUrl?: string | null }) {
  async function handleCopy() {
    try {
      await copyLink(url);
      toast.success("Link produk berhasil disalin");
    } catch {
      toast.error("Link belum dapat disalin. Salin alamat dari bilah browser.");
    }
  }

  async function handleInstagram() {
    const shareData = { title: productName, text: `Lihat ${productName}`, url };
    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
        await navigator.share(shareData);
        return;
      }
      await copyLink(url);
      window.open(instagramUrl || "https://www.instagram.com/", "_blank", "noopener,noreferrer");
      toast.info("Link disalin. Tempelkan link saat membagikan di Instagram.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Bagikan link melalui menu berbagi perangkat atau salin link secara manual.");
    }
  }

  const whatsappShare = `https://wa.me/?text=${encodeURIComponent(`Lihat ${productName}: ${url}`)}`;
  const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  return (
    <div>
      <p className="mb-3 text-sm font-bold">Bagikan Produk</p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleCopy} size="sm" type="button" variant="outline"><Clipboard aria-hidden="true" /> Salin Link</Button>
        <Button asChild size="sm" variant="outline"><a href={whatsappShare} rel="noreferrer" target="_blank"><MessageCircle aria-hidden="true" /> WhatsApp</a></Button>
        <Button asChild size="sm" variant="outline"><a href={facebookShare} rel="noreferrer" target="_blank"><Share2 aria-hidden="true" /> Facebook</a></Button>
        <Button onClick={handleInstagram} size="sm" type="button" variant="outline"><Camera aria-hidden="true" /> Instagram</Button>
      </div>
    </div>
  );
}
