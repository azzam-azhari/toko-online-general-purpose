import { afterEach, describe, expect, it } from "vitest";

import { getRequestIp, resetRateLimitsForTests, takeRateLimit } from "./rate-limit";

afterEach(resetRateLimitsForTests);

describe("takeRateLimit", () => {
  it("menolak permintaan setelah batas tercapai", () => {
    expect(takeRateLimit({ key: "login:1", limit: 2, windowMs: 60_000, now: 1_000 }).allowed).toBe(true);
    expect(takeRateLimit({ key: "login:1", limit: 2, windowMs: 60_000, now: 2_000 }).allowed).toBe(true);

    const blocked = takeRateLimit({ key: "login:1", limit: 2, windowMs: 60_000, now: 3_000 });
    expect(blocked).toEqual({ allowed: false, remaining: 0, retryAfterSeconds: 58 });
  });

  it("membuka jendela baru setelah periode berakhir", () => {
    takeRateLimit({ key: "login:2", limit: 1, windowMs: 1_000, now: 1_000 });
    expect(takeRateLimit({ key: "login:2", limit: 1, windowMs: 1_000, now: 2_001 }).allowed).toBe(true);
  });
});

describe("getRequestIp", () => {
  it("mengambil alamat pertama dari proxy tepercaya", () => {
    expect(getRequestIp(new Headers({ "x-forwarded-for": "203.0.113.4, 10.0.0.1" }))).toBe("203.0.113.4");
  });

  it("menolak nilai header yang berisi karakter tak aman", () => {
    expect(getRequestIp(new Headers({ "x-forwarded-for": "attacker<script>" }))).toBe("unknown");
  });

  it("menggunakan x-real-ip bila proxy tidak mengirim daftar forwarded", () => {
    expect(getRequestIp(new Headers({ "x-real-ip": "2001:db8::1" }))).toBe("2001:db8::1");
    expect(getRequestIp(new Headers())).toBe("unknown");
  });
});
