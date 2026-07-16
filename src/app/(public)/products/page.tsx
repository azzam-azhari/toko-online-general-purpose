import type { Metadata } from "next";
import { ChevronDown, ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  getStorefrontCategories,
  getStorefrontProducts,
} from "@/lib/repositories/storefront.repository";
import { formatRupiah, parseCatalogPriceFilter } from "@/lib/storefront";
import type { CatalogSort } from "@/types/storefront";

import { ProductCard } from "../_components/product-card";
import { ProductFilters } from "./product-filters";

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

function catalogHrefWithout(params: SearchParams, keys: string[]) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const item = first(value);
    if (item && key !== "page" && !keys.includes(key)) query.set(key, item);
  }
  const suffix = query.toString();
  return suffix ? `/products?${suffix}` : "/products";
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const q = first(params.q)?.trim() ?? "";
  const categoryValue = first(params.category) ?? "";
  const category = categoryValue === "__all__" ? "" : categoryValue;
  const availability = first(params.availability) === "available" ? "available" : "all";
  const sortValue = first(params.sort);
  const sort: CatalogSort = ["latest", "price-asc", "price-desc", "name", "popular"].includes(sortValue ?? "")
    ? (sortValue as CatalogSort)
    : "latest";
  const page = Math.max(1, Number(first(params.page)) || 1);
  const minPrice = parseCatalogPriceFilter(first(params.minPrice));
  const maxPrice = parseCatalogPriceFilter(first(params.maxPrice));

  const [categories, result] = await Promise.all([
    getStorefrontCategories(),
    getStorefrontProducts({ search: q, category, availability, sort, page, minPrice, maxPrice }),
  ]);
  const categoryName = categories.find((item) => item.slug === category)?.name ?? category;
  const activeFilters = [
    q ? { key: "q", label: `Pencarian: “${q}”` } : null,
    category ? { key: "category", label: `Kategori: ${categoryName}` } : null,
    minPrice !== undefined ? { key: "minPrice", label: `Harga mulai ${formatRupiah(minPrice)}` } : null,
    maxPrice !== undefined ? { key: "maxPrice", label: `Harga sampai ${formatRupiah(maxPrice)}` } : null,
    availability === "available" ? { key: "availability", label: "Stok tersedia" } : null,
  ].filter((item): item is { key: string; label: string } => item !== null);

  return (
    <main>
      <section className="border-b bg-secondary/70">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[.16em] text-accent">Katalog</p>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Temukan produk yang Anda butuhkan.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            Cari berdasarkan nama atau Kode Produk, lalu gunakan filter untuk mempersempit pilihan.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside>
          <Card className="lg:hidden">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 font-bold [&::-webkit-details-marker]:hidden lg:hidden">
                <span className="flex items-center gap-2"><SlidersHorizontal aria-hidden="true" className="size-4" /> Filter Produk</span>
                <ChevronDown aria-hidden="true" className="size-4 transition-transform group-open:rotate-180" />
              </summary>
              <CardContent className="border-t p-5">
                <ProductFilters availability={availability} categories={categories} category={category} idPrefix="mobile" maxPrice={maxPrice} minPrice={minPrice} q={q} sort={sort} />
              </CardContent>
            </details>
          </Card>
          <Card className="hidden lg:sticky lg:top-24 lg:block">
            <CardContent className="p-5">
              <div className="mb-5 flex items-center gap-2 font-bold"><SlidersHorizontal aria-hidden="true" className="size-4" /> Filter Produk</div>
              <ProductFilters availability={availability} categories={categories} category={category} idPrefix="desktop" maxPrice={maxPrice} minPrice={minPrice} q={q} sort={sort} />
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
              <Select defaultValue={sort} name="sort">
                <SelectTrigger className="min-w-44" id="sort"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Terbaru</SelectItem>
                  <SelectItem value="popular">Pilihan</SelectItem>
                  <SelectItem value="price-asc">Harga terendah</SelectItem>
                  <SelectItem value="price-desc">Harga tertinggi</SelectItem>
                  <SelectItem value="name">Nama A–Z</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" type="submit">Terapkan</Button>
            </form>
          </div>

          {activeFilters.length ? (
            <div className="mb-6 rounded-xl border bg-secondary/40 p-3 sm:p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{activeFilters.length} filter aktif</p>
                <Button asChild className="h-auto px-0 py-1" size="sm" variant="link"><Link href="/products">Hapus semua</Link></Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {activeFilters.map((item) => (
                  <Link
                    aria-label={`Hapus filter ${item.label}`}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-semibold transition hover:border-primary/30 hover:text-primary"
                    href={catalogHrefWithout(params, [item.key])}
                    key={item.key}
                  >
                    {item.label}<X aria-hidden="true" className="size-3.5" />
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {result.products.length ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
              {result.products.map((product) => <ProductCard key={product.id} product={product} />)}
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
