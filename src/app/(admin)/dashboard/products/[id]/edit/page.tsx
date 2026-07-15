import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/common/page-header";
import { ProductStatusBadge } from "@/components/common/status-badge";
import { getCategories, getProductById } from "@/lib/repositories/catalog.repository";

import { ProductForm } from "../../product-form";

export const metadata: Metadata = { title: "Edit Produk", robots: { index: false, follow: false } };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProductById(id), getCategories()]);
  if (!product) notFound();
  return (
    <div className="space-y-6">
      <PageHeader action={<ProductStatusBadge status={product.status} />} description="Perbarui produk lalu simpan sebagai draft atau terbitkan perubahan." eyebrow="Produk" title={product.name} />
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
