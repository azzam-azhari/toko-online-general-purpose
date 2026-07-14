import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/auth/get-admin-session";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Masuk Admin",
  robots: { index: false, follow: false },
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [session, params] = await Promise.all([getAdminSession(), searchParams]);

  if (session) redirect("/dashboard");

  const notice =
    params.error === "unauthorized"
      ? "Silakan masuk dengan akun admin aktif untuk membuka dashboard."
      : undefined;

  return <LoginForm nextPath={params.next} notice={notice} />;
}

