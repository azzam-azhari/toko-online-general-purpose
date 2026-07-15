import { NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase/service";

const headers = { "Cache-Control": "no-store, max-age=0" };

export async function GET() {
  const supabase = createServiceClient();
  const { error } = await supabase.from("store_settings").select("id").limit(1);
  if (error) {
    console.error("[readiness] database check failed", { code: error.code });
    return NextResponse.json({ status: "degraded" }, { status: 503, headers });
  }
  return NextResponse.json({ status: "ready" }, { headers });
}
