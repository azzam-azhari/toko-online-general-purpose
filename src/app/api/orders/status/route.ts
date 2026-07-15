import { createHash, timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { getRequestIp, takeRateLimit } from "@/lib/security/rate-limit";
import { createServiceClient } from "@/lib/supabase/service";
import { publicOrderLookupSchema } from "@/validations/operations.schema";

function normalizeContact(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized.includes("@")) return normalized;
  const digits = normalized.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

function contactsMatch(provided: string, email: string | null, phone: string) {
  const candidate = createHash("sha256").update(normalizeContact(provided)).digest();
  return [email, phone].filter((value): value is string => Boolean(value)).some((value) => {
    const expected = createHash("sha256").update(normalizeContact(value)).digest();
    return timingSafeEqual(candidate, expected);
  });
}

const noStoreHeaders = { "Cache-Control": "no-store, max-age=0" };

export async function POST(request: Request) {
  const ip = getRequestIp(request.headers);
  const rateLimit = takeRateLimit({ key: `order-status:${ip}`, limit: 10, windowMs: 15 * 60 * 1000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Silakan tunggu sebelum mencoba lagi." },
      { status: 429, headers: { ...noStoreHeaders, "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const parsed = publicOrderLookupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Nomor pesanan atau kontak tidak valid." }, { status: 400, headers: noStoreHeaders });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("orders")
    .select("order_number, customer_email, customer_phone, status, payment_status, sales_channel, grand_total, created_at, updated_at, order_items(product_name, quantity, line_total)")
    .eq("order_number", parsed.data.order_number)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("[order-status] lookup failed", { code: error.code });
    return NextResponse.json({ error: "Status pesanan belum dapat diperiksa." }, { status: 503, headers: noStoreHeaders });
  }
  if (!data || !contactsMatch(parsed.data.contact, data.customer_email, data.customer_phone)) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan atau kontak tidak cocok." }, { status: 404, headers: noStoreHeaders });
  }

  return NextResponse.json({
    order: {
      order_number: data.order_number,
      status: data.status,
      payment_status: data.payment_status,
      sales_channel: data.sales_channel,
      grand_total: Number(data.grand_total),
      created_at: data.created_at,
      updated_at: data.updated_at,
      items: (data.order_items ?? []).map((item) => ({
        product_name: item.product_name,
        quantity: item.quantity,
        line_total: Number(item.line_total),
      })),
    },
  }, { headers: noStoreHeaders });
}
