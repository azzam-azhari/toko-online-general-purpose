import { expect, test } from "@playwright/test";

test("health check tidak di-cache dan tidak membocorkan detail internal", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.ok()).toBe(true);
  expect(await response.json()).toEqual({ status: "ok" });
  expect(response.headers()["cache-control"]).toContain("no-store");
});

test("pengunjung dapat membuka beranda dan katalog", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /Lewati ke konten utama/i })).toBeAttached();

  const mobileMenu = page.getByRole("button", { name: "Buka menu" });
  if (await mobileMenu.isVisible()) await mobileMenu.click();
  await page.getByRole("link", { name: "Katalog", exact: true }).first().click();
  await expect(page).toHaveURL(/\/products$/);
  await expect(page.getByRole("heading", { level: 1, name: /Temukan produk/i })).toBeVisible();

  const mobileFilterToggle = page.locator("#main-content summary").filter({ hasText: "Filter Produk" });
  if (await mobileFilterToggle.isVisible()) {
    await mobileFilterToggle.click();
    await expect(page.locator("#mobile-catalog-search")).toBeVisible();
  } else {
    await expect(page.locator("#desktop-catalog-search")).toBeVisible();
  }
});

test("landing page menampilkan jumlah produk pada setiap kategori", async ({ page }) => {
  await page.goto("/");

  const categoryCount = page.locator("#kategori").getByText(/^\d+ produk$/).first();
  await categoryCount.scrollIntoViewIfNeeded();
  await expect(categoryCount).toBeVisible();
  await expect(categoryCount).toHaveClass(/font-light/);
});

test("animasi landing page menunggu elemen masuk viewport", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const reveals = page.locator("[data-landing-reveal]");
  expect(await reveals.count()).toBeGreaterThan(5);

  const hero = reveals.first();
  const finalCta = reveals.last();
  await expect(hero).toBeInViewport();
  await expect(hero).toHaveCSS("opacity", "1");
  await expect(finalCta).not.toBeInViewport();
  await expect(finalCta).toHaveCSS("opacity", "0");

  await finalCta.scrollIntoViewIfNeeded();
  await expect(finalCta).toBeInViewport();
  await expect(finalCta).toHaveCSS("opacity", "1");
});

test("navbar responsif menjaga pencarian dan hamburger tetap terpisah", async ({ page }) => {
  for (const viewport of [
    { width: 320, height: 740 },
    { width: 768, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");

    await expect(page.getByRole("button", { name: "Buka pencarian" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Buka menu" })).toBeVisible();
    expect(await page.locator("body").evaluate((body) => body.scrollWidth)).toBeLessThanOrEqual(viewport.width);

    await page.getByRole("button", { name: "Buka menu" }).click();
    const menuDialog = page.getByRole("dialog");
    await expect(menuDialog.getByRole("navigation", { name: "Navigasi seluler" })).toBeVisible();
    await expect(menuDialog.locator("input")).toHaveCount(0);
    await expect(page.locator("input:focus")).toHaveCount(0);
    await menuDialog.getByRole("button", { name: "Tutup" }).click();

    await page.getByRole("button", { name: "Buka pencarian" }).click();
    await expect(page.getByRole("dialog").getByRole("searchbox", { name: "Cari produk" })).toBeVisible();
    await page.getByRole("dialog").getByRole("button", { name: "Tutup" }).click();
  }

  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Navigasi utama" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Buka pencarian" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Buka menu" })).toBeHidden();
  expect(await page.locator("body").evaluate((body) => body.scrollWidth)).toBeLessThanOrEqual(1024);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("searchbox", { name: "Cari produk" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Buka menu" })).toBeHidden();
  expect(await page.locator("body").evaluate((body) => body.scrollWidth)).toBeLessThanOrEqual(1440);
});

test("dashboard tanpa sesi selalu diarahkan ke login", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login\?error=unauthorized/);
  await expect(page.getByRole("heading", { name: /Masuk ke Dashboard/i })).toBeVisible();
});

test("halaman status pesanan tersedia dan menolak lookup tidak valid", async ({ page, request }) => {
  await page.goto("/order/status");
  await expect(page.getByRole("heading", { level: 1, name: /Periksa Status Pesanan/i })).toBeVisible();
  await expect(page.getByLabel("Nomor pesanan")).toBeVisible();
  await expect(page.getByLabel("Email atau nomor telepon")).toBeVisible();

  const response = await request.post("/api/orders/status", { data: { order_number: "x", contact: "1" } });
  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({ error: "Nomor pesanan atau kontak tidak valid." });
});

test("respons halaman membawa header keamanan utama", async ({ page }) => {
  const response = await page.goto("/");
  expect(response).not.toBeNull();

  const headers = response!.headers();
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
});
