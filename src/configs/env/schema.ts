import { z } from "zod";

const optionalKey = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);

const clientInputSchema = z
  .object({
    appUrl: z.url(),
    appName: z.string().trim().min(1).default("NusaMart"),
    supabaseUrl: z.url(),
    supabasePublishableKey: optionalKey,
    supabaseAnonKey: optionalKey,
  })
  .refine((value) => value.supabasePublishableKey || value.supabaseAnonKey, {
    message: "Isi NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY atau NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    path: ["supabasePublishableKey"],
  });

const serverOnlySchema = z.object({
  serviceRoleKey: z.string().min(1),
});

export function parseClientEnv(input: unknown) {
  const parsed = clientInputSchema.parse(input);

  return {
    appUrl: parsed.appUrl,
    appName: parsed.appName,
    supabaseUrl: parsed.supabaseUrl,
    supabaseKey: parsed.supabasePublishableKey ?? parsed.supabaseAnonKey!,
  };
}

export function parseServerEnv(input: unknown) {
  return {
    ...parseClientEnv(input),
    ...serverOnlySchema.parse(input),
  };
}
