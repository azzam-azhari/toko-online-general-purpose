import { describe, expect, it } from "vitest";

import { createSlug } from "./slug";

describe("createSlug", () => {
  it("membuat slug kebab-case yang stabil", () => {
    expect(createSlug("  Kopi Susu Gula Aren!  ")).toBe("kopi-susu-gula-aren");
  });
});
