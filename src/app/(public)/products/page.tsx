import type { Metadata } from "next";
import { ChevronLeft, ChevronRight, Filter, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { serverEnv } from "@/configs/env/server";
import {
  getStorefrontCategories,
  getStorefrontProducts,
  getStorefrontSettings,
} from "@/lib/repositories/storefront.repository";
import { parseCatalogPriceFilter } from "@/lib/storefront";
import type { CatalogSort } from "@/types/storefront";

import { ProductCard } from "../_components/product-card";

export const metadata: Metadata = {
  title: "Katalog Produk",
  description: "Jelajahi produk aktif NusaMart berdasarkan kategori, harga, dan ketersediaan.",
  alternates: { canonical: "/products" },
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function catalogHref(params: SearchParams, page: number) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const item = first(value);
    if (item && key !== "page") query.set(key, item);
  }
  if (page > 1) query.set("page", String(page));
  const suffix = query.toString();
  return suffix ? `/products?${suffix}` : "/products";
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const q = first(params.q)?.trim() ?? "";
  const category = first(params.category) ?? "";
  const availability = first(params.availability) === "available" ? "available" : "all";
  const sortValue = first(params.sort);
  const sort: CatalogSort = ["latest", "price-asc", "price-desc", "name", "popular"].includes(sortValue ?? "")
    ? (sortValue as CatalogSort)
    : "latest";
  const page = Math.max(1, Number(first(params.page)) || 1);
  const minPrice = parseCatalogPriceFilter(first(params.minPrice));
  const maxPrice = parseCatalogPriceFilter(first(params.maxPrice));

  const [settings, categories, result] = await Promise.all([
    getStorefrontSettings(),
    getStorefrontCategories(),
    getStorefrontProducts({ search: q, category, availability, sort, page, minPrice, maxPrice }),
  ]);

  return (
    <main>
      <section className="border-b bg-secondary/70">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[.16em] text-accent">Katalog</p>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Temukan produk yang Anda butuhkan.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            Cari berdasarkan nama atau SKU, lalu gunakan filter untuk mempersempit pilihan.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside>
          <Card className="sticky top-24">
            <CardContent className="p-5">
              <div className="mb-5 flex items-center gap-2 font-bold"><SlidersHorizontal aria-hidden="true" className="size-4" /> Filter Produk</div>
              <form action="/products" className="grid gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold" htmlFor="catalog-search">Cari</label>
                  <div className="relative"><Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" defaultValue={q} id="catalog-search" name="q" placeholder="Nama atau SKU" /></div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold" htmlFor="catalog-category">Kategori</label>
                  <Select defaultValue={category} id="catalog-category" name="category">
                    <option value="">Semua kategori</option>
                    {categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="mb-1.5 block text-xs font-semibold" htmlFor="min-price">Harga min.</label><Input defaultValue={minPrice} id="min-price" min="0" name="minPrice" placeholder="0" step="1000" type="number" /></div>
                  <div><label className="mb-1.5 block text-xs font-semibold" htmlFor="max-price">Harga maks.</label><Input defaultValue={maxPrice} id="max-price" min="0" name="maxPrice" placeholder="Bebas" step="1000" type="number" /></div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold" htmlFor="availability">Ketersediaan</label>
                  <Select defaultValue={availability} id="availability" name="availability"><option value="all">Semua stok</option><option value="available">Stok tersedia</option></Select>
                </div>
                <input name="sort" type="hidden" value={sort} />
                <Button type="submit"><Filter aria-hidden="true" /> Terapkan Filter</Button>
                <Button asChild type="button" variant="ghost"><Link href="/products">Hapus Filter</Link></Button>
              </form>
            </CardContent>
          </Card>
        </aside>

        <section aria-labelledby="catalog-results">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="font-bold" id="catalog-results">{q ? `Hasil untuk “${q}”` : "Semua Produk"}</h2><p className="text-sm text-muted-foreground">{result.total} produk ditemukan</p></div>
            <form action="/products" className="flex items-center gap-2">
              {q ? <input name="q" type="hidden" value={q} /> : null}
              {category ? <input name="category" type="hidden" value={category} /> : null}
              {availability !== "all" ? <input name="availability" type="hidden" value={availability} /> : null}
              {minPrice !== undefined ? <input name="minPrice" type="hidden" value={minPrice} /> : null}
              {maxPrice !== undefined ? <input name="maxPrice" type="hidden" value={maxPrice} /> : null}
              <label className="text-xs font-semibold" htmlFor="sort">Urutkan</label>
              <Select className="min-w-44" defaultValue={sort} id="sort" name="sort"><option value="latest">Terbaru</option><option value="popular">Pilihan</option><option value="price-asc">Harga terendah</option><option value="price-desc">Harga tertinggi</option><option value="name">Nama A–Z</option></Select>
              <Button size="sm" type="submit">Terapkan</Button>
            </form>
          </div>

          {result.products.length ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
              {result.products.map((product) => <ProductCard appUrl={serverEnv.appUrl} key={product.id} product={product} settings={settings} />)}
            </div>
          ) : (
            <Card className="border-dashed"><CardContent className="grid min-h-72 place-items-center p-8 text-center"><div><Search aria-hidden="true" className="mx-auto size-10 text-muted-foreground" /><h2 className="mt-4 font-serif text-2xl">Produk tidak ditemukan</h2><p className="mt-2 text-sm text-muted-foreground">Coba kata kunci lain atau hapus beberapa filter.</p><Button asChild className="mt-5" variant="outline"><Link href="/products">Lihat semua produk</Link></Button></div></CardContent></Card>
          )}

          {result.totalPages > 1 ? (
            <nav aria-label="Navigasi halaman katalog" className="mt-10 flex items-center justify-center gap-2">
              <Button asChild={result.page > 1} disabled={result.page <= 1} size="icon" variant="outline">{result.page > 1 ? <Link aria-label="Halaman sebelumnya" href={catalogHref(params, result.page - 1)}><ChevronLeft aria-hidden="true" /></Link> : <span><ChevronLeft aria-hidden="true" /></span>}</Button>
              <span className="px-3 text-sm text-muted-foreground">Halaman {result.page} dari {result.totalPages}</span>
              <Button asChild={result.page < result.totalPages} disabled={result.page >= result.totalPages} size="icon" variant="outline">{result.page < result.totalPages ? <Link aria-label="Halaman berikutnya" href={catalogHref(params, result.page + 1)}><ChevronRight aria-hidden="true" /></Link> : <span><ChevronRight aria-hidden="true" /></span>}</Button>
            </nav>
          ) : null}
        </section>
      </div>
    </main>
  );
}
