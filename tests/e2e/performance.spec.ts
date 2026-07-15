import { expect, test } from "@playwright/test";

test("beranda berada dalam budget aset frontend", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const budget = await page.evaluate(() => {
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const total = (type: string) =>
      resources
        .filter((item) => item.initiatorType === type)
        .reduce((sum, item) => sum + (item.encodedBodySize || item.transferSize), 0);

    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    return {
      cssBytes: total("link"),
      jsBytes: total("script"),
      responseStartMs: navigation.responseStart,
    };
  });

  expect(budget.jsBytes, `JavaScript ${budget.jsBytes} byte melebihi budget`).toBeLessThan(1_200_000);
  expect(budget.cssBytes, `CSS ${budget.cssBytes} byte melebihi budget`).toBeLessThan(250_000);
  expect(budget.responseStartMs, `TTFB lokal ${budget.responseStartMs} ms terlalu lambat`).toBeLessThan(5_000);
});
