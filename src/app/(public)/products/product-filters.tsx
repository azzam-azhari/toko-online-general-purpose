import { Filter, Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CatalogSort, StorefrontCategory } from "@/types/storefront";

export function ProductFilters({
  idPrefix,
  q,
  category,
  categories,
  minPrice,
  maxPrice,
  availability,
  sort,
}: {
  idPrefix: string;
  q: string;
  category: string;
  categories: StorefrontCategory[];
  minPrice?: number;
  maxPrice?: number;
  availability: "available" | "all";
  sort: CatalogSort;
}) {
  const searchId = `${idPrefix}-catalog-search`;
  const categoryId = `${idPrefix}-catalog-category`;
  const minPriceId = `${idPrefix}-min-price`;
  const maxPriceId = `${idPrefix}-max-price`;
  const availabilityId = `${idPrefix}-availability`;

  return (
    <form action="/products" className="grid gap-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold" htmlFor={searchId}>Cari</label>
        <div className="relative"><Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" defaultValue={q} id={searchId} name="q" placeholder="Nama atau Kode Produk" /></div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold" htmlFor={categoryId}>Kategori</label>
        <Select defaultValue={category || "__all__"} name="category">
          <SelectTrigger className="h-11 w-full" id={categoryId}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Semua kategori</SelectItem>
            {categories.map((item) => <SelectItem key={item.id} value={item.slug}>{item.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className="mb-1.5 block text-xs font-semibold" htmlFor={minPriceId}>Harga min.</label><Input defaultValue={minPrice} id={minPriceId} min="0" name="minPrice" placeholder="0" step="1000" type="number" /></div>
        <div><label className="mb-1.5 block text-xs font-semibold" htmlFor={maxPriceId}>Harga maks.</label><Input defaultValue={maxPrice} id={maxPriceId} min="0" name="maxPrice" placeholder="Bebas" step="1000" type="number" /></div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold" htmlFor={availabilityId}>Ketersediaan</label>
        <Select defaultValue={availability} name="availability">
          <SelectTrigger className="h-11 w-full" id={availabilityId}><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Semua stok</SelectItem><SelectItem value="available">Stok tersedia</SelectItem></SelectContent>
        </Select>
      </div>
      <input name="sort" type="hidden" value={sort} />
      <Button type="submit"><Filter aria-hidden="true" /> Terapkan Filter</Button>
      <Button asChild type="button" variant="ghost"><Link href="/products">Hapus Filter</Link></Button>
    </form>
  );
}
