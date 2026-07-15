import { BarChart3 } from "lucide-react";

import { formatRupiah } from "@/lib/money";
import type { SalesPoint } from "@/types/operations";

export function SalesChart({ data }: { data: SalesPoint[] }) {
  const max = Math.max(...data.map((point) => point.revenue), 0);
  if (max === 0) return <div className="grid min-h-64 place-items-center rounded-xl border border-dashed bg-secondary/30 p-8 text-center"><div><BarChart3 aria-hidden="true" className="mx-auto size-9 text-muted-foreground" /><p className="mt-3 text-sm font-semibold">Belum ada penjualan lunas</p><p className="mt-1 text-xs text-muted-foreground">Grafik akan terisi dari pesanan berstatus pembayaran lunas.</p></div></div>;
  return <div><div aria-label="Grafik pendapatan 14 hari" className="flex h-64 items-end gap-1.5 sm:gap-2" role="img">{data.map((point) => { const height = Math.max(4, Math.round((point.revenue / max) * 100)); return <div className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-2" key={point.date}><div className="relative flex h-52 w-full items-end"><div className="w-full rounded-t-md bg-primary transition hover:bg-primary/80" style={{ height: `${height}%` }}><span className="sr-only">{point.label}: {formatRupiah(point.revenue)}, {point.orders} pesanan</span></div><div className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] text-background group-hover:block">{formatRupiah(point.revenue)}</div></div><span className="hidden text-[10px] text-muted-foreground sm:block">{point.label}</span></div>; })}</div><p className="mt-4 text-xs text-muted-foreground">Pendapatan hanya menghitung order dengan pembayaran berstatus lunas.</p></div>;
}
