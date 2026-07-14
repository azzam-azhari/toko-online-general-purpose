"use server";

import { redirect } from "next/navigation";

import { serverEnv } from "@/configs/env/server";
import { createClient } from "@/lib/supabase/server";
import type { AdminProfile, AuthActionState } from "@/types/auth";
import {
  forgotPasswordSchema,
  getSafeDashboardPath,
  loginSchema,
  resetPasswordSchema,
} from "@/validations/auth.schema";

function validationError(error: { flatten: () => { fieldErrors: Record<string, string[]> } }): AuthActionState {
  return {
    status: "error",
    message: "Periksa kembali data yang Anda masukkan.",
    fieldErrors: error.flatten().fieldErrors,
  };
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });

  if (!parsed.success) return validationError(parsed.error);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return { status: "error", message: "Email atau password tidak sesuai." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, is_active")
    .eq("id", data.user.id)
    .eq("role", "admin")
    .eq("is_active", true)
    .maybeSingle<AdminProfile>();

  if (!profile) {
    await supabase.auth.signOut();
    return { status: "error", message: "Akun ini tidak memiliki akses admin aktif." };
  }

  redirect(getSafeDashboardPath(parsed.data.next));
}

export async function forgotPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) return validationError(parsed.error);

  await (await createClient()).auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${serverEnv.appUrl}/auth/confirm?next=/reset-password`,
  });

  return {
    status: "success",
    message: "Jika email terdaftar, tautan pemulihan password telah dikirim.",
  };
}

export async function updatePasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) return validationError(parsed.error);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Tautan pemulihan tidak valid atau sudah kedaluwarsa." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { status: "error", message: "Password belum dapat diperbarui. Coba minta tautan baru." };
  }

  await supabase.auth.signOut();

  return { status: "success", message: "Password berhasil diperbarui. Silakan masuk kembali." };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

