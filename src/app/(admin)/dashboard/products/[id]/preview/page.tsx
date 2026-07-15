import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/common/page-header";
import { ProductPreview } from "@/components/common/product-preview";
import { Button } from "@/components/ui/button";
import { getProductById } from "@/lib/repositories/catalog.repository";

export const metadata: Metadata = { title: "Pratinjau Produk", robots: { index: false, follow: false } };

export default async function ProductPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();
  return (
    <div className="space-y-6">
      <PageHeader action={<Button asChild variant="outline"><Link href={`/dashboard/products/${id}/edit`}><ArrowLeft aria-hidden="true" /> Kembali ke Edit</Link></Button>} description="Halaman aman khusus admin untuk memeriksa tampilan produk draft maupun aktif." eyebrow="Pratinjau" title={product.name} />
      <div className="mx-auto max-w-2xl">
        <ProductPreview
          imageUrl={product.product_images[0]?.url}
          product={{
            name: product.name,
            short_description: product.short_description ?? undefined,
            price: product.price,
            compare_at_price: product.compare_at_price ?? undefined,
            stock: product.stock,
            cta_type: product.cta_type === "custom_url" ? "custom_url" : "whatsapp",
            cta_label: product.cta_label,
          }}
        />
      </div>
    </div>
  );
}
