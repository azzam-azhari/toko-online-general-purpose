import "server-only";

import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type { AdminProfile } from "@/types/auth";

export type AdminSession = {
  user: User;
  profile: AdminProfile;
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, is_active")
    .eq("id", user.id)
    .eq("role", "admin")
    .eq("is_active", true)
    .maybeSingle<AdminProfile>();

  if (!profile) return null;

  return { user, profile };
}

