import "server-only";

import { parseServerEnv } from "./schema";

export const serverEnv = parseServerEnv({
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
  appName: process.env.NEXT_PUBLIC_APP_NAME,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
});
