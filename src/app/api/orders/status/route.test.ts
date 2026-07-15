import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetRateLimitsForTests } from "@/lib/security/rate-limit";

const mocks = vi.hoisted(() => ({ maybeSingle: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          is: () => ({ maybeSingle: mocks.maybeSingle }),
        }),
      }),
    }),
  }),
}));

import { POST } from "./route";

function request(body: unknown, ip = "127.0.0.1") {
  return new Request("https://shop.example.com/api/orders/status", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

const order = {
  order_number: "ORD-20260715-ABC12345",
  customer_email: "ayu@example.com",
  customer_phone: "081234567890",
  status: "confirmed",
  payment_status: "paid",
  sales_channel: "whatsapp",
  grand_total: 178000,
  created_at: "2026-07-15T00:00:00.000Z",
  updated_at: "2026-07-15T01:00:00.000Z",
  order_items: [{ product_name: "Botol Minum", quantity: 2, line_total: 178000 }],
};

describe("POST /api/orders/status", () => {
  beforeEach(() => {
    resetRateLimitsForTests();
    mocks.maybeSingle.mockReset();
  });

  it("mengembalikan status aman saat nomor dan kontak cocok", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: order, error: null });
    const response = await POST(request({ order_number: order.order_number, contact: "+62 812-3456-7890" }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(payload.order.payment_status).toBe("paid");
    expect(payload.order.grand_total).toBe(178000);
    expect(JSON.stringify(payload)).not.toContain("ayu@example.com");
    expect(JSON.stringify(payload)).not.toContain("081234567890");
  });

  it("memberi respons generik saat kontak tidak cocok", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: order, error: null });
    const response = await POST(request({ order_number: order.order_number, contact: "other@example.com" }));
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Pesanan tidak ditemukan atau kontak tidak cocok." });
  });

  it("menolak payload invalid sebelum query database", async () => {
    const response = await POST(request({ order_number: "x", contact: "1" }));
    expect(response.status).toBe(400);
    expect(mocks.maybeSingle).not.toHaveBeenCalled();
  });

  it("menyembunyikan detail error database", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: null, error: { code: "DATABASE_DOWN", message: "secret detail" } });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await POST(request({ order_number: order.order_number, contact: "ayu@example.com" }));
    consoleSpy.mockRestore();

    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain("secret detail");
  });
});
