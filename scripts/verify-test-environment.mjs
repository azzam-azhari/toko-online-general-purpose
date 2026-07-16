import { existsSync } from "node:fs";

import { createClient } from "@supabase/supabase-js";

for (const file of [".env.test.local", ".env.local", ".env.test", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const requestTimeoutMs = 10_000;
const timedFetch = (input, init = {}) =>
  fetch(input, {
    ...init,
    signal: init.signal ?? AbortSignal.timeout(requestTimeoutMs),
  });

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`[test:integration] Environment variable ${name} wajib diisi.`);
  return value;
}

function validUrl(name, value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`[test:integration] ${name} harus berupa URL yang valid.`);
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`[test:integration] ${name} harus menggunakan protokol HTTP atau HTTPS.`);
  }
  return url;
}

function rejectPlaceholder(name, value) {
  if (/placeholder|example\.supabase\.co/i.test(value)) {
    throw new Error(`[test:integration] ${name} masih menggunakan nilai placeholder CI.`);
  }
}

function describeError(error) {
  if (error instanceof Error) return [error.name, error.message].filter(Boolean).join(": ");
  return [error?.code, error?.message, error?.details, error?.hint].filter(Boolean).join(" | ") || "unknown error";
}

function assertQuery(label, result) {
  if (result.error) {
    throw new Error(`[test:integration] ${label} gagal: ${describeError(result.error)}`);
  }
  if (!result.data?.length) {
    throw new Error(`[test:integration] ${label} tidak menemukan fixture yang diwajibkan.`);
  }
}

async function verifyRemoteApplication(baseUrl) {
  const readinessUrl = new URL("/api/health/ready", baseUrl);
  const response = await timedFetch(readinessUrl, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`[test:integration] ${readinessUrl.pathname} mengembalikan HTTP ${response.status}.`);
  }
  console.log("[test:integration] Aplikasi remote dan database berstatus ready.");
}

async function verifyLocalApplicationDatabase() {
  validUrl("NEXT_PUBLIC_APP_URL", required("NEXT_PUBLIC_APP_URL"));
  const supabaseUrl = validUrl("NEXT_PUBLIC_SUPABASE_URL", required("NEXT_PUBLIC_SUPABASE_URL")).toString();
  const publicKey = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
  if (!publicKey) {
    throw new Error("[test:integration] Isi NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY atau NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  const serviceRoleKey = required("SUPABASE_SERVICE_ROLE_KEY");

  rejectPlaceholder("NEXT_PUBLIC_SUPABASE_URL", supabaseUrl);
  rejectPlaceholder("Supabase public key", publicKey);
  rejectPlaceholder("SUPABASE_SERVICE_ROLE_KEY", serviceRoleKey);
  if (publicKey === serviceRoleKey) {
    throw new Error("[test:integration] Public key dan service role key tidak boleh sama.");
  }

  const options = {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { fetch: timedFetch },
  };
  const publicClient = createClient(supabaseUrl, publicKey, options);
  const serviceClient = createClient(supabaseUrl, serviceRoleKey, options);

  const [serviceSettings, publicSettings, categories, products, productCategories] = await Promise.all([
    serviceClient.from("store_settings").select("id").limit(1),
    publicClient.from("store_settings").select("id").limit(1),
    publicClient.from("categories").select("id").eq("is_active", true).is("deleted_at", null).limit(1),
    publicClient.from("products").select("id").eq("status", "active").is("deleted_at", null).limit(1),
    publicClient
      .from("product_categories")
      .select("category_id, products!inner(id)")
      .eq("products.status", "active")
      .limit(1),
  ]);

  assertQuery("Akses database dengan service role", serviceSettings);
  assertQuery("Profil toko public", publicSettings);
  assertQuery("Kategori aktif", categories);
  assertQuery("Produk aktif", products);
  assertQuery("Relasi kategori dan produk", productCategories);

  console.log("[test:integration] Environment, Supabase API/auth, migrasi, dan fixture storefront siap.");
}

try {
  if (process.env.PLAYWRIGHT_BASE_URL) {
    await verifyRemoteApplication(validUrl("PLAYWRIGHT_BASE_URL", process.env.PLAYWRIGHT_BASE_URL));
  } else {
    await verifyLocalApplicationDatabase();
  }
} catch (error) {
  console.error(describeError(error));
  process.exitCode = 1;
}
