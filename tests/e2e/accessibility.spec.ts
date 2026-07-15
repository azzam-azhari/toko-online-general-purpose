import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const publicPages = ["/", "/products", "/about", "/contact", "/faq", "/privacy", "/terms", "/order/status", "/login", "/forgot-password"];

for (const path of publicPages) {
  test(`${path} tidak memiliki pelanggaran WCAG A/AA otomatis`, async ({ page }) => {
    await page.goto(path);
    await page.locator("body").waitFor({ state: "visible" });

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
}

test("skip link menjadi fokus pertama dan memindahkan fokus ke konten", async ({ page }) => {
  await page.goto("/");
  const skipLink = page.getByRole("link", { name: "Lewati ke konten utama", exact: true });

  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});
