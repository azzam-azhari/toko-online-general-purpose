"use client";

import { ImageIcon, ShoppingBag } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { calculateDiscount, formatRupiah } from "@/lib/money";
import type { ProductFormValues } from "@/validations/product.schema";

type ProductPreviewProps = {
  product: Partial<ProductFormValues>;
  imageUrl?: string;
};

const ctaLabels = {
  custom_url: "Tautan eksternal",
  whatsapp: "WhatsApp",
  midtrans: "Midtrans",
};

export function ProductPreview({ product, imageUrl }: ProductPreviewProps) {
  const price = Number(product.price) || 0;
  const compareAtPrice = product.compare_at_price ? Number(product.compare_at_price) : null;
  const discount = calculateDiscount(price, compareAtPrice);

  return (
    <article className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="relative aspect-[4/3] bg-secondary">
        {imageUrl ? (
          <Image alt={product.name || "Pratinjau produk"} className="object-cover" fill sizes="640px" src={imageUrl} unoptimized={imageUrl.startsWith("blob:")} />
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground">
            <ImageIcon aria-hidden="true" className="size-10 opacity-45" />
          </div>
        )}
        {discount ? <Badge className="absolute left-4 top-4 bg-accent text-accent-foreground">Hemat {discount}%</Badge> : null}
      </div>
      <div className="space-y-4 p-5 sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Pratinjau produk</p>
          <h2 className="mt-2 font-serif text-3xl">{product.name || "Nama produk"}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {product.short_description || "Deskripsi singkat produk akan tampil di sini."}
          </p>
        </div>
        <div className="flex flex-wrap items-baseline gap-3">
          <strong className="text-2xl text-primary">{formatRupiah(price)}</strong>
          {compareAtPrice && compareAtPrice > price ? (
            <span className="text-sm text-muted-foreground line-through">{formatRupiah(compareAtPrice)}</span>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-4 rounded-xl bg-secondary/70 p-3 text-sm">
          <span>Stok tersedia</span>
          <strong>{Number(product.stock) || 0}</strong>
        </div>
        <Button className="w-full" size="lg" type="button">
          <ShoppingBag aria-hidden="true" /> {product.cta_label || "Beli Sekarang"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Tujuan tombol: {product.cta_type ? ctaLabels[product.cta_type] : "Belum dipilih"}
        </p>
      </div>
    </article>
  );
}
