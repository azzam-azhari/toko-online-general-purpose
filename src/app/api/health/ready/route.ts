import { NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase/service";

const headers = { "Cache-Control": "no-store, max-age=0" };

export async function GET() {
  const supabase = createServiceClient();
  const [settings, categories, products] = await Promise.all([
    supabase.from("store_settings").select("id").limit(1).maybeSingle(),
    supabase
      .from("categories")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)
      .is("deleted_at", null),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .neq("cta_type", "midtrans")
      .is("deleted_at", null),
  ]);

  const failedQuery = [
    { resource: "store_settings", error: settings.error },
    { resource: "categories", error: categories.error },
    { resource: "products", error: products.error },
  ].find((check) => check.error);

  if (failedQuery) {
    const { resource, error } = failedQuery;
    console.error("[readiness] database query failed", {
      resource,
      code: error?.code,
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
    });
    return NextResponse.json({ status: "degraded" }, { status: 503, headers });
  }

  const missing = [
    !settings.data ? "store_settings" : null,
    (categories.count ?? 0) < 1 ? "categories" : null,
    (products.count ?? 0) < 1 ? "products" : null,
  ].filter(Boolean);

  if (missing.length) {
    console.error("[readiness] required storefront data is missing", { resources: missing });
    return NextResponse.json({ status: "degraded" }, { status: 503, headers });
  }

  return NextResponse.json({ status: "ready" }, { headers });
}
