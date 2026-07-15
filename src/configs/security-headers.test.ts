import { describe, expect, it } from "vitest";

import { buildContentSecurityPolicy, getSecurityHeaders } from "./security-headers";

describe("security headers", () => {
  it("membatasi sumber aktif dan mengizinkan backend Supabase tepercaya", () => {
    const policy = buildContentSecurityPolicy({
      production: true,
      supabaseUrl: "https://example.supabase.co",
    });

    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("connect-src 'self' https://example.supabase.co wss://example.supabase.co");
    expect(policy).toContain("upgrade-insecure-requests");
    expect(policy).not.toContain("'unsafe-eval'");
  });

  it("mengabaikan backend dengan protokol yang tidak aman", () => {
    const policy = buildContentSecurityPolicy({
      production: true,
      supabaseUrl: "javascript:alert(1)",
    });

    expect(policy).not.toContain("javascript:");
  });

  it("memberi kelonggaran dev hanya untuk hot reload lokal", () => {
    const policy = buildContentSecurityPolicy({
      production: false,
      supabaseUrl: "http://127.0.0.1:54321",
    });

    expect(policy).toContain("'unsafe-eval'");
    expect(policy).toContain("http://127.0.0.1:54321");
    expect(policy).toContain("ws://127.0.0.1:54321");
    expect(policy).not.toContain("upgrade-insecure-requests");
  });

  it("mengirim header anti-sniffing dan anti-framing", () => {
    const headers = new Map(getSecurityHeaders("https://example.supabase.co").map((item) => [item.key, item.value]));

    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("Permissions-Policy")).toContain("camera=()");
  });
});
