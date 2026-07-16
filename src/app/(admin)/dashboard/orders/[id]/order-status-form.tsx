"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { updateOrderStatusAction } from "@/actions/operations.actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { OrderStatus } from "@/types/operations";

const allowed: Record<OrderStatus, OrderStatus[]> = { pending: ["cancelled"], confirmed: ["processing", "cancelled"], processing: ["shipped", "cancelled"], shipped: ["completed"], completed: [], cancelled: [] };
const labels: Record<OrderStatus, string> = { pending: "Menunggu", confirmed: "Dikonfirmasi", processing: "Diproses", shipped: "Dikirim", completed: "Selesai", cancelled: "Dibatalkan" };

export function OrderStatusForm({ id, status }: { id: string; status: OrderStatus }) {
  const router = useRouter(); const [pending, setPending] = useState(false); const [nextStatus, setNextStatus] = useState<OrderStatus | "">(""); const [note, setNote] = useState("");
  if (allowed[status].length === 0) return <p className="rounded-lg bg-secondary p-4 text-sm text-muted-foreground">Pesanan ini sudah berada pada status akhir.</p>;
  async function submit(event: React.FormEvent) { event.preventDefault(); if (!nextStatus) return; setPending(true); const result = await updateOrderStatusAction({ order_id: id, status: nextStatus, note }); setPending(false); if (!result.ok) return toast.error(result.error.message); toast.success("Status pesanan berhasil diperbarui."); router.refresh(); }
  return <form className="grid gap-4" onSubmit={submit}><div><Label htmlFor="next-status">Status berikutnya</Label><Select onValueChange={(value) => setNextStatus(value as OrderStatus)} value={nextStatus}><SelectTrigger className="h-11 w-full" id="next-status"><SelectValue placeholder="Pilih status" /></SelectTrigger><SelectContent>{allowed[status].map((option) => <SelectItem key={option} value={option}>{labels[option]}</SelectItem>)}</SelectContent></Select></div><div><Label htmlFor="status-note">Catatan perubahan</Label><Textarea id="status-note" onChange={(event) => setNote(event.target.value)} placeholder={nextStatus === "cancelled" ? "Alasan pembatalan wajib diisi" : "Opsional, contoh: Paket diserahkan ke kurir"} value={note} /></div><Button disabled={pending || !nextStatus || (nextStatus === "cancelled" && !note.trim())} type="submit">{pending ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}Perbarui Status</Button></form>;
}
