import { describe, expect, it } from "vitest";

import { getSafeDashboardPath, loginSchema, resetPasswordSchema } from "./auth.schema";

describe("auth schemas", () => {
  it("menerima kredensial admin development", () => {
    expect(loginSchema.safeParse({ email: "admin@gmail.com", password: "admin123" }).success).toBe(true);
    expect(
      resetPasswordSchema.safeParse({ password: "admin123", confirmPassword: "admin123" }).success,
    ).toBe(true);
  });

  it("menolak redirect keluar dashboard", () => {
    expect(getSafeDashboardPath("https://example.com")).toBe("/dashboard");
    expect(getSafeDashboardPath("//example.com/dashboard")).toBe("/dashboard");
    expect(getSafeDashboardPath("/dashboard/products")).toBe("/dashboard/products");
  });
});

