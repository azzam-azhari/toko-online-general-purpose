import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderStatusBadge, PaymentStatusBadge, orderStatusLabels } from "@/components/common/order-status-badges";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/require-admin";
import { formatRupiah } from "@/lib/money";
import { getOrderById } from "@/lib/repositories/operations.repository";

import { OrderStatusForm } from "./order-status-form";
import { PaymentStatusForm } from "./payment-status-form";

export const metadata: Metadata = { title: "Detail Pesanan", robots: { index: false } };

function formatAddress(value: Record<string, unknown> | null) {
  if (!value) return "Alamat belum tersedia.";
  return Object.values(value)
    .filter((part): part is string => typeof part === "string" && Boolean(part.trim()))
    .join(", ") || "Alamat belum tersedia.";
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const formatter = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  });
  const payment = order.payments[0];

  return (
    <div className="space-y-6">
      <Button asChild size="sm" variant="ghost">
        <Link href="/dashboard/orders"><ArrowLeft aria-hidden="true" />Kembali ke Pesanan</Link>
      </Button>
      <PageHeader
        description={`Dibuat ${formatter.format(new Date(order.created_at))} melalui ${order.sales_channel === "whatsapp" ? "WhatsApp" : "tautan eksternal"}.`}
        eyebrow="Pesanan"
        title={order.order_number}
      />

      {order.reconciliation_required ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Perlu rekonsiliasi manual.</strong> Periksa pembayaran dan stok sebelum melanjutkan pemenuhan.
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,.85fr)]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="font-sans text-xl">Item Pesanan</CardTitle>
                  <CardDescription>Snapshot produk saat pesanan dibuat.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <OrderStatusBadge status={order.status} />
                  <PaymentStatusBadge status={order.payment_status} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {order.items.length ? (
                <div className="divide-y">
                  {order.items.map((item) => (
                    <div className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0" key={item.id}>
                      <div>
                        <strong className="text-sm">{item.product_name}</strong>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.product_sku ?? "Tanpa Kode Produk"} · {item.quantity} × {formatRupiah(item.unit_price)}
                        </p>
                      </div>
                      <strong className="text-sm">{formatRupiah(item.line_total)}</strong>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">Item pesanan belum tersedia.</p>}
              <dl className="mt-5 grid gap-2 border-t pt-5 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatRupiah(order.subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Diskon</dt><dd>-{formatRupiah(order.discount_total)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Pengiriman</dt><dd>{formatRupiah(order.shipping_total)}</dd></div>
                <div className="mt-2 flex justify-between border-t pt-3 text-base font-bold"><dt>Total</dt><dd>{formatRupiah(order.grand_total)}</dd></div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-sans text-xl">Timeline Status</CardTitle></CardHeader>
            <CardContent>
              {order.history.length ? (
                <ol className="relative ml-2 border-l pl-6">
                  {order.history.map((entry) => (
                    <li className="relative pb-6 last:pb-0" key={entry.id}>
                      <span className="absolute -left-[1.82rem] top-1 size-3 rounded-full border-2 border-background bg-primary" />
                      <strong className="text-sm">{orderStatusLabels[entry.to_status]}</strong>
                      <p className="mt-1 text-xs text-muted-foreground">{formatter.format(new Date(entry.created_at))} · {entry.actor_name ?? "Sistem"}</p>
                      {entry.note ? <p className="mt-2 text-sm leading-6">{entry.note}</p> : null}
                    </li>
                  ))}
                </ol>
              ) : <p className="text-sm text-muted-foreground">Riwayat status belum tersedia.</p>}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card>
            <CardHeader><CardTitle className="font-sans text-xl">Pelanggan</CardTitle></CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <strong>{order.customer_name}</strong>
              {order.customer_email ? <a className="flex gap-2 text-muted-foreground hover:text-foreground" href={`mailto:${order.customer_email}`}><Mail aria-hidden="true" className="size-4" />{order.customer_email}</a> : null}
              <a className="flex gap-2 text-muted-foreground hover:text-foreground" href={`tel:${order.customer_phone}`}><Phone aria-hidden="true" className="size-4" />{order.customer_phone}</a>
              <p className="flex gap-2 leading-6 text-muted-foreground"><MapPin aria-hidden="true" className="mt-1 size-4 shrink-0" />{formatAddress(order.customer_address)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-sans text-xl">Perbarui Status</CardTitle>
              <CardDescription>Transisi mengikuti alur pemenuhan yang telah ditetapkan.</CardDescription>
            </CardHeader>
            <CardContent><OrderStatusForm id={order.id} status={order.status} /></CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-sans text-xl">Pembayaran Eksternal</CardTitle>
              <CardDescription>Catat hasil verifikasi admin, tanpa menyimpan nomor kartu, PIN, OTP, atau secret.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><PaymentStatusBadge status={order.payment_status} /></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Metode</span><span>{order.sales_channel === "whatsapp" ? "WhatsApp" : "Tautan eksternal"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Referensi</span><span className="max-w-48 truncate">{payment?.transaction_id ?? order.source_reference ?? "—"}</span></div>
              {payment?.paid_at ? <div className="flex justify-between"><span className="text-muted-foreground">Dibayar</span><span>{formatter.format(new Date(payment.paid_at))}</span></div> : null}
              <PaymentStatusForm id={order.id} status={order.payment_status} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
