import { PackageSearch, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/common/order-status-badges";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { requireAdmin } from "@/lib/auth/require-admin";
import { formatRupiah } from "@/lib/money";
import { getOrders } from "@/lib/repositories/operations.repository";
import type { OrderStatus, PaymentStatus } from "@/types/operations";

export const metadata: Metadata = { title: "Pesanan", robots: { index: false } };
const orderStatuses = new Set(["all", "pending", "confirmed", "processing", "shipped", "completed", "cancelled"]);
const paymentStatuses = new Set(["all", "unpaid", "pending", "paid", "failed", "expired", "refunded"]);

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; payment?: string; page?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const status = orderStatuses.has(params.status ?? "all") ? (params.status ?? "all") : "all";
  const payment = paymentStatuses.has(params.payment ?? "all") ? (params.payment ?? "all") : "all";
  const page = Math.max(Number(params.page) || 1, 1);
  const { orders, total, pageSize } = await getOrders({ search: params.q, status: status as OrderStatus | "all", payment: payment as PaymentStatus | "all", page });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const query = new URLSearchParams(); if (params.q) query.set("q", params.q); if (status !== "all") query.set("status", status); if (payment !== "all") query.set("payment", payment);
  return <div className="space-y-6"><PageHeader description="Pantau pelanggan, pembayaran, item, dan progres pemenuhan pesanan." eyebrow="Operasional" title="Pesanan" />
    <Card><CardContent className="p-4"><form className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]" method="get"><div className="relative"><Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" defaultValue={params.q} name="q" placeholder="Nomor pesanan, pelanggan, atau telepon..." /></div><Select defaultValue={status} name="status"><option value="all">Semua status order</option><option value="pending">Menunggu</option><option value="confirmed">Dikonfirmasi</option><option value="processing">Diproses</option><option value="shipped">Dikirim</option><option value="completed">Selesai</option><option value="cancelled">Dibatalkan</option></Select><Select defaultValue={payment} name="payment"><option value="all">Semua pembayaran</option><option value="unpaid">Belum dibayar</option><option value="pending">Menunggu bayar</option><option value="paid">Lunas</option><option value="failed">Gagal</option><option value="expired">Kedaluwarsa</option><option value="refunded">Dikembalikan</option></Select><Button type="submit" variant="secondary">Terapkan</Button></form></CardContent></Card>
    {orders.length === 0 ? <EmptyState description={params.q || status !== "all" || payment !== "all" ? "Coba ubah kata kunci atau filter." : "Pesanan internal akan tampil ketika alur checkout diaktifkan pada Phase 8."} icon={PackageSearch} title="Pesanan tidak ditemukan" /> : <div className="overflow-hidden rounded-xl border bg-card"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b bg-secondary/70 text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3">Pesanan</th><th className="px-4 py-3">Pelanggan</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Pembayaran</th><th className="px-4 py-3 text-right">Aksi</th></tr></thead><tbody className="divide-y">{orders.map((order) => <tr className="hover:bg-secondary/30" key={order.id}><td className="px-4 py-3"><Link className="font-semibold hover:text-primary hover:underline" href={`/dashboard/orders/${order.id}`}>{order.order_number}</Link><time className="mt-1 block text-xs text-muted-foreground">{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(order.created_at))}</time></td><td className="px-4 py-3"><strong>{order.customer_name}</strong><span className="block text-xs text-muted-foreground">{order.customer_phone}</span></td><td className="px-4 py-3 font-semibold">{formatRupiah(order.grand_total)}</td><td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td><td className="px-4 py-3"><PaymentStatusBadge status={order.payment_status} /></td><td className="px-4 py-3 text-right"><Button asChild size="sm" variant="outline"><Link href={`/dashboard/orders/${order.id}`}>Lihat Detail</Link></Button></td></tr>)}</tbody></table></div></div>}
    {totalPages > 1 ? <nav aria-label="Paginasi pesanan" className="flex items-center justify-between gap-3 text-sm"><p className="text-muted-foreground">Halaman {page} dari {totalPages} Â· {total} pesanan</p><div className="flex gap-2"><Button asChild={page > 1} disabled={page <= 1} variant="outline">{page > 1 ? <Link href={`/dashboard/orders?${new URLSearchParams([...query, ["page", String(page - 1)]])}`}>Sebelumnya</Link> : <span>Sebelumnya</span>}</Button><Button asChild={page < totalPages} disabled={page >= totalPages} variant="outline">{page < totalPages ? <Link href={`/dashboard/orders?${new URLSearchParams([...query, ["page", String(page + 1)]])}`}>Berikutnya</Link> : <span>Berikutnya</span>}</Button></div></nav> : null}
  </div>;
}
