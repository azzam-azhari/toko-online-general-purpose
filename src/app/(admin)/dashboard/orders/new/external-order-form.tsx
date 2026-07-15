"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { createExternalOrderAction } from "@/actions/operations.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatRupiah } from "@/lib/money";
import type { ExternalOrderProduct, ExternalSalesChannel } from "@/types/operations";

type ItemInput = { key: string; product_id: string; quantity: number };

function createItem(key = crypto.randomUUID()): ItemInput {
  return { key, product_id: "", quantity: 1 };
}

export function ExternalOrderForm({ products }: { products: ExternalOrderProduct[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [channel, setChannel] = useState<ExternalSalesChannel>("whatsapp");
  const [items, setItems] = useState<ItemInput[]>([createItem("initial-item")]);
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const availableProducts = useMemo(
    () => products.filter((product) => product.sales_channel === channel && product.available_stock > 0),
    [channel, products],
  );

  function setItem(index: number, patch: Partial<ItemInput>) {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    const result = await createExternalOrderAction({
      idempotency_key: idempotencyKey,
      sales_channel: channel,
      customer_name: form.get("customer_name"),
      customer_email: form.get("customer_email"),
      customer_phone: form.get("customer_phone"),
      source_reference: form.get("source_reference"),
      notes: form.get("notes"),
      items: items.map(({ product_id, quantity }) => ({ product_id, quantity })),
    });
    setPending(false);
    if (!result.ok) return toast.error(result.error.message);
    toast.success("Pesanan eksternal berhasil dicatat.");
    router.push(`/dashboard/orders/${result.data.id}`);
    router.refresh();
  }

  return (
    <form className="grid gap-6" onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="sales-channel">Kanal pesanan</Label>
          <Select
            id="sales-channel"
            onChange={(event) => {
              setChannel(event.target.value as ExternalSalesChannel);
              setItems([createItem()]);
            }}
            value={channel}
          >
            <option value="whatsapp">WhatsApp</option>
            <option value="custom_url">Tautan eksternal</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="source-reference">Referensi kanal</Label>
          <Input id="source-reference" name="source_reference" placeholder="Contoh: nomor chat atau invoice eksternal" />
        </div>
        <div>
          <Label htmlFor="customer-name">Nama pelanggan</Label>
          <Input id="customer-name" maxLength={120} name="customer_name" required />
        </div>
        <div>
          <Label htmlFor="customer-phone">Nomor WhatsApp/telepon</Label>
          <Input id="customer-phone" maxLength={24} name="customer_phone" placeholder="081234567890" required />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="customer-email">Email pelanggan</Label>
          <Input id="customer-email" maxLength={254} name="customer_email" type="email" />
        </div>
      </div>

      <fieldset className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <legend className="text-sm font-semibold">Item pesanan</legend>
            <p className="mt-1 text-xs text-muted-foreground">Hanya produk aktif dengan kanal yang sama dapat dipilih.</p>
          </div>
          <Button onClick={() => setItems((current) => [...current, createItem()])} size="sm" type="button" variant="outline">
            <Plus aria-hidden="true" />Tambah Item
          </Button>
        </div>
        {items.map((item, index) => {
          const product = products.find((candidate) => candidate.id === item.product_id);
          return (
            <div className="grid gap-3 rounded-xl border p-4 sm:grid-cols-[minmax(0,1fr)_120px_auto] sm:items-end" key={item.key}>
              <div>
                <Label htmlFor={`product-${item.key}`}>Produk</Label>
                <Select id={`product-${item.key}`} onChange={(event) => setItem(index, { product_id: event.target.value })} required value={item.product_id}>
                  <option value="">Pilih produk</option>
                  {availableProducts.map((option) => (
                    <option disabled={items.some((current, currentIndex) => currentIndex !== index && current.product_id === option.id)} key={option.id} value={option.id}>
                      {option.name} · {formatRupiah(option.price)} · stok {option.available_stock}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor={`quantity-${item.key}`}>Jumlah</Label>
                <Input
                  id={`quantity-${item.key}`}
                  max={Math.min(100, product?.available_stock ?? 100)}
                  min={1}
                  onChange={(event) => setItem(index, { quantity: Number(event.target.value) })}
                  required
                  type="number"
                  value={item.quantity}
                />
              </div>
              <Button
                aria-label="Hapus item"
                disabled={items.length === 1}
                onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </div>
          );
        })}
        {availableProducts.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Tidak ada produk aktif dan berstok untuk kanal ini.</p>
        ) : null}
      </fieldset>

      <div>
        <Label htmlFor="notes">Catatan internal</Label>
        <Textarea id="notes" maxLength={1000} name="notes" placeholder="Opsional. Jangan menyimpan data pembayaran sensitif." />
      </div>

      <div className="flex justify-end">
        <Button disabled={pending || availableProducts.length === 0} type="submit">
          {pending ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
          Simpan Pesanan
        </Button>
      </div>
    </form>
  );
}
