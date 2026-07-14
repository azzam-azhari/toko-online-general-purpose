import { parseClientEnv } from "./schema";

export const clientEnv = parseClientEnv({
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
  appName: process.env.NEXT_PUBLIC_APP_NAME,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});
