import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Atur Password Baru",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage() {
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();

  if (!user) redirect("/forgot-password");

  return <ResetPasswordForm />;
}

