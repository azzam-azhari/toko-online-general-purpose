import "server-only";

import { redirect } from "next/navigation";

import { getAdminSession } from "./get-admin-session";

export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/login?error=unauthorized");
  }

  return session;
}

