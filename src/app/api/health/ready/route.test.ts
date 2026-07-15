import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ limit: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({
    from: () => ({ select: () => ({ limit: mocks.limit }) }),
  }),
}));

import { GET } from "./route";

describe("GET /api/health/ready", () => {
  beforeEach(() => mocks.limit.mockReset());

  it("mengembalikan ready ketika database dapat dibaca", async () => {
    mocks.limit.mockResolvedValue({ error: null });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(await response.json()).toEqual({ status: "ready" });
  });

  it("mengembalikan degraded tanpa detail internal", async () => {
    mocks.limit.mockResolvedValue({ error: { code: "DB_DOWN", message: "secret detail" } });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await GET();
    consoleSpy.mockRestore();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: "degraded" });
  });
});
