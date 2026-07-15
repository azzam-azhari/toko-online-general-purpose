import { AlertTriangle, PackageCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { ProductStatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getLowStockReport } from "@/lib/repositories/operations.repository";
import type { ProductStatus } from "@/types/catalog";

export const metadata: Metadata = { title: "Stok Rendah", robots: { index: false } };
export default async function InventoryPage() { await requireAdmin(); const report = await getLowStockReport(); return <div className="space-y-6"><PageHeader action={<Button asChild variant="outline"><Link href="/dashboard/content/store-profile#operational-settings">Ubah Batas Stok</Link></Button>} description={`Produk dengan stok tersedia ${report.threshold} atau kurang memerlukan perhatian.`} eyebrow="Operasional" title="Laporan Stok Rendah" />
  <Card><CardHeader><CardTitle className="flex items-center gap-2 font-sans text-xl"><AlertTriangle aria-hidden="true" className="text-amber-600" />{report.products.length} produk perlu diperiksa</CardTitle><CardDescription>Stok tersedia dihitung dari stok fisik dikurangi stok yang sedang direservasi.</CardDescription></CardHeader></Card>
  {report.products.length === 0 ? <EmptyState description="Semua produk berada di atas batas stok rendah." icon={PackageCheck} title="Stok dalam kondisi aman" /> : <div className="overflow-hidden rounded-xl border bg-card"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b bg-secondary/70 text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3">Produk</th><th className="px-4 py-3">Stok fisik</th><th className="px-4 py-3">Direservasi</th><th className="px-4 py-3">Tersedia</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Aksi</th></tr></thead><tbody className="divide-y">{report.products.map((product) => <tr className={product.available_stock <= 0 ? "bg-red-50/50" : ""} key={product.id}><td className="px-4 py-3"><strong>{product.name}</strong><span className="block text-xs text-muted-foreground">{product.sku}</span></td><td className="px-4 py-3">{product.stock}</td><td className="px-4 py-3">{product.reserved_stock}</td><td className="px-4 py-3"><strong className={product.available_stock <= 0 ? "text-destructive" : "text-amber-700"}>{product.available_stock}</strong></td><td className="px-4 py-3"><ProductStatusBadge status={product.status as ProductStatus} /></td><td className="px-4 py-3 text-right"><Button asChild size="sm" variant="outline"><Link href={`/dashboard/products/${product.id}/edit`}>Perbarui Stok</Link></Button></td></tr>)}</tbody></table></div></div>}
  </div>; }
