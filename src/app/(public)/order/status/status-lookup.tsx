"use client";

import { Loader2, Search } from "lucide-react";
import { useState } from "react";

import { OrderStatusBadge, PaymentStatusBadge } from "@/components/common/order-status-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatRupiah } from "@/lib/money";
import type { ExternalSalesChannel, OrderStatus, PaymentStatus } from "@/types/operations";

type PublicOrder = {
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  sales_channel: ExternalSalesChannel;
  grand_total: number;
  created_at: string;
  updated_at: string;
  items: Array<{ product_name: string; quantity: number; line_total: number }>;
};

export function OrderStatusLookup() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<PublicOrder | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    setOrder(null);
    const response = await fetch("/api/orders/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_number: form.get("order_number"), contact: form.get("contact") }),
    }).catch(() => null);
    const payload = response ? await response.json().catch(() => null) : null;
    setPending(false);
    if (!response?.ok || !payload?.order) {
      setError(payload?.error ?? "Status pesanan belum dapat diperiksa. Silakan coba lagi.");
      return;
    }
    setOrder(payload.order as PublicOrder);
  }

  const formatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" });

  return (
    <div className="mt-10 grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-sans text-xl">Cari Pesanan</CardTitle>
          <CardDescription>Data kontak hanya digunakan untuk mencocokkan pesanan dan tidak ditampilkan kembali.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={submit}>
            <div>
              <Label htmlFor="order-number">Nomor pesanan</Label>
              <Input autoCapitalize="characters" id="order-number" maxLength={80} name="order_number" placeholder="ORD-20260715-ABC12345" required />
            </div>
            <div>
              <Label htmlFor="order-contact">Email atau nomor telepon</Label>
              <Input id="order-contact" maxLength={254} name="contact" required />
            </div>
            {error ? <p aria-live="polite" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
            <Button disabled={pending} type="submit">
              {pending ? <Loader2 aria-hidden="true" className="animate-spin" /> : <Search aria-hidden="true" />}
              Periksa Status
            </Button>
          </form>
        </CardContent>
      </Card>

      {order ? (
        <Card aria-live="polite">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><CardTitle className="font-sans text-xl">{order.order_number}</CardTitle><CardDescription>Diperbarui {formatter.format(new Date(order.updated_at))}</CardDescription></div>
              <div className="flex gap-2"><OrderStatusBadge status={order.status} /><PaymentStatusBadge status={order.payment_status} /></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {order.items.map((item) => (
                <div className="flex justify-between gap-4 py-3 first:pt-0" key={`${item.product_name}-${item.quantity}`}>
                  <span className="text-sm">{item.product_name} × {item.quantity}</span>
                  <strong className="text-sm">{formatRupiah(item.line_total)}</strong>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t pt-4"><span className="text-sm text-muted-foreground">Total</span><strong>{formatRupiah(order.grand_total)}</strong></div>
            <p className="mt-4 rounded-lg bg-secondary p-3 text-xs leading-5 text-muted-foreground">Kanal: {order.sales_channel === "whatsapp" ? "WhatsApp" : "tautan eksternal"}. Hubungi toko bila status belum sesuai bukti transaksi Anda.</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
