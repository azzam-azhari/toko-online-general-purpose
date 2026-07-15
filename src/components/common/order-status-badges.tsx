import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus, PaymentStatus } from "@/types/operations";

const orderLabels: Record<OrderStatus, string> = { pending: "Menunggu", confirmed: "Dikonfirmasi", processing: "Diproses", shipped: "Dikirim", completed: "Selesai", cancelled: "Dibatalkan" };
const paymentLabels: Record<PaymentStatus, string> = { unpaid: "Belum dibayar", pending: "Menunggu bayar", paid: "Lunas", failed: "Gagal", expired: "Kedaluwarsa", refunded: "Dikembalikan" };

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge className={cn(status === "completed" && "border-emerald-200 bg-emerald-50 text-emerald-800", status === "cancelled" && "border-red-200 bg-red-50 text-red-800", status === "processing" && "border-blue-200 bg-blue-50 text-blue-800", status === "shipped" && "border-violet-200 bg-violet-50 text-violet-800")} variant="outline">{orderLabels[status]}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge className={cn(status === "paid" && "border-emerald-200 bg-emerald-50 text-emerald-800", ["failed", "expired"].includes(status) && "border-red-200 bg-red-50 text-red-800", status === "refunded" && "border-violet-200 bg-violet-50 text-violet-800")} variant="outline">{paymentLabels[status]}</Badge>;
}

export const orderStatusLabels = orderLabels;
