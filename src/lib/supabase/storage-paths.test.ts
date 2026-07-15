import { describe, expect, it } from "vitest";

import { getSafeEntityStoragePaths, isSafeEntityStoragePath } from "./storage-paths";

const entityId = "11111111-1111-4111-8111-111111111111";

describe("Supabase Storage paths", () => {
  it("hanya menerima file di dalam folder entity yang sesuai", () => {
    expect(isSafeEntityStoragePath(`${entityId}/image.webp`, entityId)).toBe(true);
    expect(isSafeEntityStoragePath(`other/image.webp`, entityId)).toBe(false);
    expect(isSafeEntityStoragePath(`${entityId}/../secret.webp`, entityId)).toBe(false);
    expect(isSafeEntityStoragePath(`${entityId}\\image.webp`, entityId)).toBe(false);
  });

  it("membersihkan spasi, path tidak aman, dan duplikasi", () => {
    expect(getSafeEntityStoragePaths([
      ` ${entityId}/image.webp `,
      `${entityId}/image.webp`,
      `${entityId}/./other.webp`,
      "/absolute.webp",
    ], entityId)).toEqual([`${entityId}/image.webp`]);
  });
});
