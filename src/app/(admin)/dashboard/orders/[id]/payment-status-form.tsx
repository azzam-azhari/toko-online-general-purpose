"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { updateExternalPaymentStatusAction } from "@/actions/operations.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { PaymentStatus } from "@/types/operations";

const options: Partial<Record<PaymentStatus, PaymentStatus[]>> = {
  unpaid: ["pending", "paid", "failed", "expired"],
  pending: ["paid", "failed", "expired"],
  failed: ["pending", "paid"],
  expired: ["pending", "paid"],
  paid: ["refunded"],
  refunded: [],
};

const labels: Record<PaymentStatus, string> = {
  unpaid: "Belum dibayar",
  pending: "Menunggu verifikasi",
  paid: "Lunas",
  failed: "Gagal",
  expired: "Kedaluwarsa",
  refunded: "Dikembalikan",
};

export function PaymentStatusForm({ id, status }: { id: string; status: PaymentStatus }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [nextStatus, setNextStatus] = useState<PaymentStatus | "">("");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const allowed = options[status] ?? [];

  if (allowed.length === 0) return <p className="rounded-lg bg-secondary p-3 text-xs text-muted-foreground">Status pembayaran ini sudah final.</p>;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!nextStatus) return;
    setPending(true);
    const result = await updateExternalPaymentStatusAction({ order_id: id, status: nextStatus, reference, note });
    setPending(false);
    if (!result.ok) return toast.error(result.error.message);
    toast.success("Status pembayaran berhasil diperbarui.");
    router.refresh();
  }

  return (
    <form className="mt-4 grid gap-4 border-t pt-4" onSubmit={submit}>
      <div>
        <Label htmlFor="payment-status">Status baru</Label>
        <Select onValueChange={(value) => setNextStatus(value as PaymentStatus)} value={nextStatus}>
          <SelectTrigger className="h-11 w-full" id="payment-status"><SelectValue placeholder="Pilih status" /></SelectTrigger>
          <SelectContent>{allowed.map((option) => <SelectItem key={option} value={option}>{labels[option]}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="payment-reference">Referensi pembayaran</Label>
        <Input id="payment-reference" maxLength={160} onChange={(event) => setReference(event.target.value)} placeholder="Nomor transfer/invoice eksternal" value={reference} />
      </div>
      <div>
        <Label htmlFor="payment-note">Catatan verifikasi</Label>
        <Textarea id="payment-note" maxLength={500} onChange={(event) => setNote(event.target.value)} placeholder="Contoh: bukti pembayaran diverifikasi admin" value={note} />
      </div>
      <Button disabled={pending || !nextStatus} type="submit">
        {pending ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
        Simpan Pembayaran
      </Button>
    </form>
  );
}
