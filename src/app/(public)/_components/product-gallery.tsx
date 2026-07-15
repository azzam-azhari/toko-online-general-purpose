"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { StorefrontProductImage } from "@/types/storefront";

import { ProductImage } from "./product-image";

export function ProductGallery({ images, productName }: { images: StorefrontProductImage[]; productName: string }) {
  const [selectedId, setSelectedId] = useState(images[0]?.id ?? "");
  const selected = images.find((image) => image.id === selectedId) ?? images[0];

  return (
    <div>
      <ProductImage
        alt={selected?.alt_text || productName}
        className="aspect-square rounded-[2rem] border"
        priority
        sizes="(max-width: 1024px) 100vw, 50vw"
        src={selected?.url}
      />
      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-5 gap-3">
          {images.slice(0, 10).map((image) => (
            <Button
              aria-label={`Tampilkan gambar ${image.alt_text || productName}`}
              className={`relative h-auto aspect-square overflow-hidden rounded-xl p-0 ${selected?.id === image.id ? "ring-2 ring-primary ring-offset-2" : ""}`}
              key={image.id}
              onClick={() => setSelectedId(image.id)}
              type="button"
              variant="outline"
            >
              <ProductImage alt="" className="absolute inset-0" sizes="100px" src={image.url} />
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
