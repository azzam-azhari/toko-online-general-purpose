import "server-only";

import { createClient } from "@supabase/supabase-js";

import { serverEnv } from "@/configs/env/server";

export function createServiceClient() {
  return createClient(serverEnv.supabaseUrl, serverEnv.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
