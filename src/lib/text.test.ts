import { describe, expect, it } from "vitest";

import { createShortDescription } from "./text";

describe("createShortDescription", () => {
  it("meringkas spasi dari deskripsi lengkap", () => {
    expect(createShortDescription("  Bahan katun\n\nyang lembut.  ")).toBe("Bahan katun yang lembut.");
  });

  it("membatasi deskripsi singkat hingga 240 karakter", () => {
    expect(createShortDescription("a".repeat(300))).toHaveLength(240);
  });
});
