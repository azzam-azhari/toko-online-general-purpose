import { ImageIcon, Package, Plus, Search } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { ProductStatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatRupiah } from "@/lib/money";
import { getCategories, getProducts } from "@/lib/repositories/catalog.repository";
import type { ProductStatus } from "@/types/catalog";

import { ProductRowActions } from "./product-row-actions";

export const metadata: Metadata = { title: "Produk", robots: { index: false, follow: false } };

const validStatuses = new Set(["all", "draft", "active", "inactive"]);

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = validStatuses.has(params.status ?? "all") ? (params.status ?? "all") : "all";
  const page = Math.max(Number(params.page) || 1, 1);
  const [{ products, total, pageSize }, categories] = await Promise.all([
    getProducts({ search: params.q, status: status as ProductStatus | "all", page }),
    getCategories(),
  ]);
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (status !== "all") query.set("status", status);

  return (
    <div className="space-y-6">
      <PageHeader
        action={<Button asChild><Link href="/dashboard/products/new"><Plus aria-hidden="true" /> Tambah Produk</Link></Button>}
        description="Kelola informasi, harga, gambar, stok, dan tujuan tombol beli."
        eyebrow="Katalog"
        title="Produk"
      />

      <Card>
        <CardContent className="p-4">
          <form className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px_auto]" method="get">
            <div className="relative">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-10" defaultValue={params.q} name="q" placeholder="Cari nama, SKU, atau slug..." />
            </div>
            <Select defaultValue={status} name="status">
              <option value="all">Semua status</option>
              <option value="active">Terbit</option>
              <option value="draft">Draft</option>
              <option value="inactive">Nonaktif</option>
            </Select>
            <Button type="submit" variant="secondary">Terapkan</Button>
          </form>
        </CardContent>
      </Card>

      {products.length === 0 ? (
        <EmptyState
          action={<Button asChild><Link href="/dashboard/products/new"><Plus aria-hidden="true" /> Tambah Produk</Link></Button>}
          description={params.q || status !== "all" ? "Coba ubah kata kunci atau filter status." : "Tambahkan produk pertama agar katalog siap diterbitkan."}
          icon={Package}
          title={params.q || status !== "all" ? "Produk tidak ditemukan" : "Belum ada produk"}
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border bg-card shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-secondary/70 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr><th className="px-4 py-3 font-semibold">Produk</th><th className="px-4 py-3 font-semibold">Harga</th><th className="px-4 py-3 font-semibold">Stok</th><th className="px-4 py-3 font-semibold">Kategori</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 text-right font-semibold">Aksi</th></tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((product) => (
                    <tr className="hover:bg-secondary/30" key={product.id}>
                      <td className="px-4 py-3"><div className="flex min-w-56 items-center gap-3"><div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-secondary">{product.product_images[0] ? <Image alt={product.product_images[0].alt_text ?? product.name} className="object-cover" fill sizes="48px" src={product.product_images[0].url} /> : <div className="grid h-full place-items-center"><ImageIcon aria-hidden="true" className="size-5 text-muted-foreground" /></div>}</div><div><Link className="font-semibold hover:text-primary hover:underline" href={`/dashboard/products/${product.id}/edit`}>{product.name}</Link><p className="mt-1 text-xs text-muted-foreground">{product.sku}</p></div></div></td>
                      <td className="px-4 py-3"><strong>{formatRupiah(product.price)}</strong>{product.compare_at_price ? <span className="mt-1 block text-xs text-muted-foreground line-through">{formatRupiah(product.compare_at_price)}</span> : null}</td>
                      <td className="px-4 py-3"><strong>{product.stock - product.reserved_stock}</strong><span className="block text-xs text-muted-foreground">dari {product.stock}</span></td>
                      <td className="max-w-44 px-4 py-3 text-muted-foreground">{product.category_ids.map((id) => categoryNames.get(id)).filter(Boolean).join(", ") || "—"}</td>
                      <td className="px-4 py-3"><ProductStatusBadge status={product.status} /></td>
                      <td className="px-4 py-3"><ProductRowActions id={product.id} name={product.name} status={product.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-3 md:hidden">
            {products.map((product) => (
              <Card key={product.id}><CardContent className="p-4"><div className="flex gap-3"><div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-secondary">{product.product_images[0] ? <Image alt={product.name} className="object-cover" fill sizes="64px" src={product.product_images[0].url} /> : <div className="grid h-full place-items-center"><ImageIcon aria-hidden="true" className="size-5 text-muted-foreground" /></div>}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><Link className="font-semibold" href={`/dashboard/products/${product.id}/edit`}>{product.name}</Link><p className="mt-1 text-xs text-muted-foreground">{product.sku}</p></div><ProductStatusBadge status={product.status} /></div><div className="mt-3 flex items-end justify-between gap-3"><div><strong className="text-sm text-primary">{formatRupiah(product.price)}</strong><p className="text-xs text-muted-foreground">Stok {product.stock - product.reserved_stock}</p></div><ProductRowActions id={product.id} name={product.name} status={product.status} /></div></div></div></CardContent></Card>
            ))}
          </div>
        </>
      )}

      {totalPages > 1 ? (
        <nav aria-label="Paginasi produk" className="flex items-center justify-between gap-3 text-sm">
          <p className="text-muted-foreground">Halaman {page} dari {totalPages} · {total} produk</p>
          <div className="flex gap-2">
            <Button asChild={page > 1} disabled={page <= 1} variant="outline">{page > 1 ? <Link href={`/dashboard/products?${new URLSearchParams([...query, ["page", String(page - 1)]])}`}>Sebelumnya</Link> : <span>Sebelumnya</span>}</Button>
            <Button asChild={page < totalPages} disabled={page >= totalPages} variant="outline">{page < totalPages ? <Link href={`/dashboard/products?${new URLSearchParams([...query, ["page", String(page + 1)]])}`}>Berikutnya</Link> : <span>Berikutnya</span>}</Button>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
