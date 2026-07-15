import { Activity, Check, Circle, FolderTree, Package, PackageCheck, PackageX, Plus, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ActivityList } from "@/components/common/activity-list";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getDashboardOverview } from "@/lib/repositories/catalog.repository";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

export default async function DashboardPage() {
  const [{ profile }, overview] = await Promise.all([requireAdmin(), getDashboardOverview()]);
  const metrics = [
    { label: "Total produk", value: overview.totalProducts, detail: `${overview.draftProducts} draft`, icon: Package },
    { label: "Produk terbit", value: overview.activeProducts, detail: "Tampil di katalog", icon: PackageCheck },
    { label: "Produk nonaktif", value: overview.inactiveProducts, detail: "Tidak tampil publik", icon: PackageX },
    { label: "Kategori", value: overview.totalCategories, detail: "Kategori aktif & nonaktif", icon: FolderTree },
  ];
  const checklist = [
    { label: "Lengkapi Profil Toko", done: overview.storeProfileComplete, note: "Kontak toko perlu dilengkapi pada fase operasional." },
    { label: "Tambah Produk", done: overview.totalProducts > 0, href: "/dashboard/products/new" },
    { label: "Terbitkan Produk", done: overview.activeProducts > 0, href: "/dashboard/products" },
    { label: "Uji Tombol Beli", done: false, href: "/dashboard/products" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader action={<Button asChild><Link href="/dashboard/products/new"><Plus aria-hidden="true" /> Tambah Produk</Link></Button>} description="Pantau kesiapan katalog dan lanjutkan pekerjaan utama toko." eyebrow="Ringkasan" title={`Halo, ${profile.full_name ?? "Admin"}.`} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, detail, icon: Icon }) => <Card key={label}><CardContent className="flex items-start justify-between gap-4 p-5"><div><p className="text-sm text-muted-foreground">{label}</p><strong className="mt-2 block text-3xl">{value}</strong><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div><span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary"><Icon aria-hidden="true" className="size-5" /></span></CardContent></Card>)}
      </div>
      {overview.lowStockProducts > 0 ? <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900"><TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" /><div><strong className="text-sm">{overview.lowStockProducts} produk memiliki stok rendah</strong><p className="mt-1 text-xs leading-5">Periksa jumlah stok sebelum produk dipromosikan.</p></div></div> : null}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card><CardHeader><CardTitle className="font-sans text-xl">Mulai Berjualan</CardTitle><CardDescription>Selesaikan langkah penting agar katalog siap digunakan.</CardDescription></CardHeader><CardContent><ol className="space-y-3">{checklist.map((item) => <li className="flex items-start gap-3 rounded-lg border p-3" key={item.label}><span className={item.done ? "grid size-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground" : "grid size-6 shrink-0 place-items-center rounded-full border text-muted-foreground"}>{item.done ? <Check aria-hidden="true" className="size-3.5" /> : <Circle aria-hidden="true" className="size-3" />}</span><div className="min-w-0 flex-1"><p className={item.done ? "text-sm font-semibold line-through opacity-65" : "text-sm font-semibold"}>{item.label}</p>{item.note ? <p className="mt-1 text-xs text-muted-foreground">{item.note}</p> : null}</div>{item.href && !item.done ? <Button asChild size="sm" variant="ghost"><Link href={item.href}>Buka</Link></Button> : null}</li>)}</ol></CardContent></Card>
        <Card><CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle className="font-sans text-xl">Aktivitas Terbaru</CardTitle><CardDescription>Perubahan katalog yang baru dilakukan.</CardDescription></div><Button asChild size="sm" variant="ghost"><Link href="/dashboard/activity"><Activity aria-hidden="true" /> Lihat Semua</Link></Button></CardHeader><ActivityList logs={overview.recentActivity} /></Card>
      </div>
    </div>
  );
}
