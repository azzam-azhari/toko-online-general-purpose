import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
}));

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": "203.0.113.10" }),
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/configs/env/server", () => ({
  serverEnv: { appUrl: "https://shop.example.com" },
}));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/security/rate-limit", () => ({
  getRequestIp: () => "203.0.113.10",
  takeRateLimit: () => ({ allowed: true, remaining: 9, retryAfterSeconds: 0 }),
}));

import { loginAction } from "./auth.actions";

function loginForm(email = "admin@example.com", password = "password123", next = "/dashboard/products") {
  const formData = new FormData();
  formData.set("email", email);
  formData.set("password", password);
  formData.set("next", next);
  return formData;
}

function createSupabaseMock({
  authError = null,
  profile = { id: "00000000-0000-0000-0000-000000000001", full_name: "Admin", role: "admin", is_active: true },
}: {
  authError?: { message: string } | null;
  profile?: Record<string, unknown> | null;
} = {}) {
  const signOut = vi.fn();
  const maybeSingle = vi.fn().mockResolvedValue({ data: profile });
  const query = { select: vi.fn(), eq: vi.fn(), maybeSingle };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);

  return {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: authError ? null : { id: "00000000-0000-0000-0000-000000000001" } },
        error: authError,
      }),
      signOut,
    },
    from: vi.fn().mockReturnValue(query),
    signOut,
  };
}

describe("loginAction integration", () => {
  beforeEach(() => vi.clearAllMocks());

  it("menghentikan input tidak valid sebelum menyentuh Auth", async () => {
    const result = await loginAction({ status: "idle" }, loginForm("bukan-email", ""));

    expect(result.status).toBe("error");
    expect(result.fieldErrors).toHaveProperty("email");
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("mengembalikan pesan generik saat kredensial salah", async () => {
    mocks.createClient.mockResolvedValue(createSupabaseMock({ authError: { message: "invalid" } }));

    const result = await loginAction({ status: "idle" }, loginForm());

    expect(result).toEqual({ status: "error", message: "Email atau password tidak sesuai." });
  });

  it("mengeluarkan sesi user yang tidak memiliki profil admin aktif", async () => {
    const supabase = createSupabaseMock({ profile: null });
    mocks.createClient.mockResolvedValue(supabase);

    const result = await loginAction({ status: "idle" }, loginForm());

    expect(supabase.signOut).toHaveBeenCalledOnce();
    expect(result).toEqual({ status: "error", message: "Akun ini tidak memiliki akses admin aktif." });
  });

  it("mengarahkan admin aktif hanya ke path dashboard yang aman", async () => {
    mocks.createClient.mockResolvedValue(createSupabaseMock());

    await expect(loginAction({ status: "idle" }, loginForm(undefined, undefined, "//evil.example"))).rejects.toThrow(
      "NEXT_REDIRECT:/dashboard",
    );
    expect(mocks.redirect).toHaveBeenCalledWith("/dashboard");
  });
});
