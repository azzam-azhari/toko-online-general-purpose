import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";
import { getCategories } from "@/lib/repositories/catalog.repository";

import { ProductForm } from "../product-form";

export const metadata: Metadata = { title: "Tambah Produk", robots: { index: false, follow: false } };

export default async function NewProductPage() {
  const categories = await getCategories();
  return (
    <div className="space-y-6">
      <PageHeader description="Isi informasi utama, lihat pratinjau, lalu simpan sebagai draft atau terbitkan." eyebrow="Produk" title="Tambah Produk" />
      <ProductForm categories={categories} />
    </div>
  );
}
