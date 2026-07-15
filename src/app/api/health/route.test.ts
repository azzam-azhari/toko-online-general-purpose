import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("GET /api/health integration", () => {
  it("mengembalikan kontrak minimum tanpa cache", async () => {
    const response = GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(await response.json()).toEqual({ status: "ok" });
  });
});
