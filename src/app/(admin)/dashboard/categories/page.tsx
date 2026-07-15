import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";
import { getCategories } from "@/lib/repositories/catalog.repository";

import { CategoryManager } from "./category-manager";

export const metadata: Metadata = { title: "Kategori", robots: { index: false, follow: false } };

export default async function CategoriesPage() {
  const categories = await getCategories();
  return <div className="space-y-6"><PageHeader description="Atur kelompok produk, hierarki sederhana, status, dan urutan tampil." eyebrow="Katalog" title="Kategori" /><CategoryManager categories={categories} /></div>;
}
