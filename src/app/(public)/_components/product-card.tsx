import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah, getDiscountPercentage } from "@/lib/storefront";
import { cn } from "@/lib/utils";
import type { StorefrontProduct } from "@/types/storefront";

import { ProductImage } from "./product-image";
import { ProductCardMotion } from "./public-motion";

export function ProductCard({
  product,
  className,
}: {
  product: StorefrontProduct;
  className?: string;
}) {
  const discount = getDiscountPercentage(product.price, product.compare_at_price);
  const primaryImage = product.images[0];

  return (
    <ProductCardMotion>
      <Card
        className={cn(
          "group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border-border/80 bg-card transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/8",
          className,
        )}
      >
        <Link
          aria-label={`Lihat detail ${product.name}`}
          className="absolute inset-0 z-10 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          href={`/products/${product.slug}`}
        />
        <ProductImage
          alt={primaryImage?.alt_text || product.name}
          className="aspect-[4/3] w-full"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          src={primaryImage?.url}
        />
        <div className="absolute left-3 top-3 z-20 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-2 pointer-events-none">
          {discount ? <Badge className="border-0 bg-accent text-white">Hemat {discount}%</Badge> : null}
          {product.is_featured ? <Badge variant="secondary">Pilihan</Badge> : null}
        </div>
        <CardContent className="relative flex flex-1 flex-col p-4 sm:p-5">
          <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <span className="truncate">{product.categories[0]?.name ?? "Pilihan NusaMart"}</span>
            <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
          <h3 className="line-clamp-2 min-h-11 text-sm font-bold leading-5 sm:text-base">{product.name}</h3>
          {product.short_description ? (
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{product.short_description}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <strong className="text-sm text-primary sm:text-base">{formatRupiah(product.price)}</strong>
            {product.compare_at_price ? (
              <del className="text-xs text-muted-foreground">{formatRupiah(product.compare_at_price)}</del>
            ) : null}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {product.available_stock > 0 ? `${product.available_stock} stok tersedia` : "Stok habis"}
          </p>
          <Button asChild className="relative z-20 mt-4 w-full" size="sm" variant="outline">
            <Link href={`/products/${product.slug}`}>Lihat Detail <ArrowRight aria-hidden="true" /></Link>
          </Button>
        </CardContent>
      </Card>
    </ProductCardMotion>
  );
}
