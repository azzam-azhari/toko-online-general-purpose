import { describe, expect, it } from "vitest";

import { parseClientEnv, parseServerEnv } from "./schema";

const validClientInput = {
  appUrl: "http://localhost:3000",
  appName: "NusaMart",
  supabaseUrl: "https://example.supabase.co",
  supabasePublishableKey: "sb_publishable_example",
  supabaseAnonKey: undefined,
};

describe("environment validation", () => {
  it("accepts a Supabase publishable key", () => {
    expect(parseClientEnv(validClientInput)).toMatchObject({
      appName: "NusaMart",
      supabaseKey: "sb_publishable_example",
    });
  });

  it("supports the legacy anon key as a fallback", () => {
    expect(
      parseClientEnv({
        ...validClientInput,
        supabasePublishableKey: undefined,
        supabaseAnonKey: "legacy-anon-key",
      }).supabaseKey,
    ).toBe("legacy-anon-key");
  });

  it("rejects configuration without a public Supabase key", () => {
    expect(() =>
      parseClientEnv({
        ...validClientInput,
        supabasePublishableKey: undefined,
      }),
    ).toThrow();
  });

  it("requires the service role key on the server", () => {
    expect(() => parseServerEnv(validClientInput)).toThrow();
    expect(
      parseServerEnv({ ...validClientInput, serviceRoleKey: "service-role-key" }).serviceRoleKey,
    ).toBe("service-role-key");
  });
});
