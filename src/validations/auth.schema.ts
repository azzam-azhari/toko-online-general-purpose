import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Masukkan alamat email yang valid.").trim().toLowerCase(),
  password: z.string().min(1, "Password wajib diisi."),
  next: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Masukkan alamat email yang valid.").trim().toLowerCase(),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password minimal 8 karakter.")
      .regex(/[A-Za-z]/, "Password harus mengandung huruf.")
      .regex(/[0-9]/, "Password harus mengandung angka."),
    confirmPassword: z.string(),
  })
  .refine((input) => input.password === input.confirmPassword, {
    message: "Konfirmasi password tidak sama.",
    path: ["confirmPassword"],
  });

export function getSafeDashboardPath(value: string | undefined) {
  if (!value || !value.startsWith("/dashboard") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

