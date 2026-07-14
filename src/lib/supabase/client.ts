"use client";

import { createBrowserClient } from "@supabase/ssr";

import { clientEnv } from "@/configs/env/client";

export function createClient() {
  return createBrowserClient(clientEnv.supabaseUrl, clientEnv.supabaseKey);
}
