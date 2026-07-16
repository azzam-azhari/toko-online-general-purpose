import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  results: new Map<string, { data: unknown; error: null | Record<string, string>; count?: number | null }>(),
}));

function query(table: string) {
  const builder: Record<string, unknown> = {};
  for (const method of ["select", "limit", "eq", "neq", "is"]) {
    builder[method] = vi.fn(() => builder);
  }
  builder.maybeSingle = vi.fn(async () => mocks.results.get(table));
  builder.then = (
    resolve: (value: unknown) => unknown,
    reject: (reason: unknown) => unknown,
  ) => Promise.resolve(mocks.results.get(table)).then(resolve, reject);
  return builder;
}

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({
    from: (table: string) => query(table),
  }),
}));

import { GET } from "./route";

describe("GET /api/health/ready", () => {
  beforeEach(() => {
    mocks.results.clear();
    mocks.results.set("store_settings", { data: { id: "settings-id" }, error: null });
    mocks.results.set("categories", { data: null, error: null, count: 3 });
    mocks.results.set("products", { data: null, error: null, count: 9 });
  });

  it("mengembalikan ready ketika database dan fixture storefront tersedia", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(await response.json()).toEqual({ status: "ready" });
  });

  it("mencatat error database asli tetapi tidak membocorkannya pada response", async () => {
    mocks.results.set("categories", {
      data: null,
      error: { code: "DB_DOWN", message: "connection refused", details: "upstream unavailable" },
      count: null,
    });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await GET();

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: "degraded" });
    expect(consoleSpy).toHaveBeenCalledWith(
      "[readiness] database query failed",
      expect.objectContaining({ resource: "categories", code: "DB_DOWN", message: "connection refused" }),
    );
    consoleSpy.mockRestore();
  });

  it("mengembalikan degraded ketika seed storefront belum tersedia", async () => {
    mocks.results.set("products", { data: null, error: null, count: 0 });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await GET();

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: "degraded" });
    expect(consoleSpy).toHaveBeenCalledWith(
      "[readiness] required storefront data is missing",
      { resources: ["products"] },
    );
    consoleSpy.mockRestore();
  });
});
