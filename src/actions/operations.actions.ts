"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath, revalidateTag } from "next/cache";

import { getAdminSession } from "@/lib/auth/get-admin-session";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/action-result";
import {
  bannerSchema,
  externalOrderSchema,
  externalPaymentUpdateSchema,
  faqSchema,
  orderStatusUpdateSchema,
  storeSettingsSchema,
  testimonialSchema,
} from "@/validations/operations.schema";

type ContentType = "banner" | "testimonial" | "faq";

const STORE_SETTINGS_ID = "00000000-0000-0000-0000-000000000001";
const STORE_SETTINGS_SELECT = "id, store_name, tagline, description, logo_path, favicon_path, contact_email, contact_phone, whatsapp_number, address, business_hours, facebook_url, instagram_url, currency, timezone, flat_shipping_fee, low_stock_threshold, seo_title, seo_description, updated_by, created_at, updated_at";

type StoreSettingsPayload = {
  store_name: string;
  tagline: string | null;
  description: string | null;
  logo_path: string | null;
  favicon_path: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  whatsapp_number: string | null;
  address: string | null;
  business_hours: { summary: string } | null;
  facebook_url: string | null;
  instagram_url: string | null;
  currency: "IDR";
  timezone: "Asia/Jakarta";
  flat_shipping_fee: number;
  low_stock_threshold: number;
  seo_title: string | null;
  seo_description: string | null;
};

type StoreSettingsRow = StoreSettingsPayload & {
  id: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function checked(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function jakartaDateTime(value?: string) {
  if (!value) return undefined;
  return new Date(`${value}:00+07:00`).toISOString();
}

function fieldErrors(error: { flatten: () => { fieldErrors: Record<string, string[]> } }) {
  return error.flatten().fieldErrors;
}

function mapDatabaseError(error: { code?: string; message: string }, fallback: string) {
  if (error.code === "42501") return { code: "FORBIDDEN", message: "Anda tidak memiliki izin untuk melakukan tindakan ini." };
  if (error.code === "P0002") return { code: "NOT_FOUND", message: error.message };
  if (error.code === "23514" || error.code === "22023" || error.code === "22P02") return { code: "VALIDATION_ERROR", message: error.message };
  return { code: "INTERNAL_ERROR", message: fallback };
}

function isMissingStoreSettingsRpc(error: { code?: string; message: string }) {
  return error.code === "PGRST202" || error.message.includes("save_store_settings");
}

async function saveStoreSettingsWithoutRpc(
  supabase: SupabaseClient,
  payload: StoreSettingsPayload,
  actorId: string,
): Promise<ActionResult<{ id: string }>> {
  const { data: current, error: readError } = await supabase
    .from("store_settings")
    .select(STORE_SETTINGS_SELECT)
    .eq("id", STORE_SETTINGS_ID)
    .maybeSingle();
  if (readError) return { ok: false, error: mapDatabaseError(readError, "Profil toko belum dapat dimuat sebelum disimpan.") };

  const before = current as StoreSettingsRow | null;
  const mutation = before
    ? supabase.from("store_settings").update({ ...payload, updated_by: actorId }).eq("id", STORE_SETTINGS_ID)
    : supabase.from("store_settings").insert({ id: STORE_SETTINGS_ID, ...payload, updated_by: actorId });
  const { data: saved, error: saveError } = await mutation.select(STORE_SETTINGS_SELECT).single();
  if (saveError) return { ok: false, error: mapDatabaseError(saveError, "Profil toko belum dapat disimpan.") };

  const { error: logError } = await supabase.from("activity_logs").insert({
    actor_id: actorId,
    action: before ? "store_settings.updated" : "store_settings.created",
    entity_type: "store_settings",
    entity_id: STORE_SETTINGS_ID,
    before_data: before,
    after_data: saved,
  });

  if (logError) {
    if (before) {
      await supabase.from("store_settings").update({
        store_name: before.store_name,
        tagline: before.tagline,
        description: before.description,
        logo_path: before.logo_path,
        favicon_path: before.favicon_path,
        contact_email: before.contact_email,
        contact_phone: before.contact_phone,
        whatsapp_number: before.whatsapp_number,
        address: before.address,
        business_hours: before.business_hours,
        facebook_url: before.facebook_url,
        instagram_url: before.instagram_url,
        currency: before.currency,
        timezone: before.timezone,
        flat_shipping_fee: before.flat_shipping_fee,
        low_stock_threshold: before.low_stock_threshold,
        seo_title: before.seo_title,
        seo_description: before.seo_description,
        updated_by: before.updated_by,
      }).eq("id", STORE_SETTINGS_ID);
    } else {
      await supabase.from("store_settings").delete().eq("id", STORE_SETTINGS_ID);
    }
    return { ok: false, error: { code: "INTERNAL_ERROR", message: "Profil toko tidak disimpan karena activity log gagal dibuat." } };
  }

  return { ok: true, data: { id: STORE_SETTINGS_ID } };
}

async function uploadStoreAsset(formData: FormData, field: string, directory: string) {
  const file = formData.get(field);
  if (!(file instanceof File) || file.size === 0) return { path: undefined as string | undefined };
  const allowed = new Map([
    ["image/avif", "avif"],
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
  ]);
  const extension = allowed.get(file.type);
  if (!extension) return { error: "Gunakan gambar AVIF, JPEG, PNG, atau WebP." };
  if (file.size > 5 * 1024 * 1024) return { error: "Ukuran gambar maksimal 5 MB." };

  const path = `${directory}/${crypto.randomUUID()}.${extension}`;
  const supabase = await createClient();
  const { error } = await supabase.storage.from("store-assets").upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { error: "Gambar belum dapat diunggah. Silakan coba lagi." };
  return { path };
}

async function cleanupAsset(path?: string) {
  if (!path) return;
  const supabase = await createClient();
  await supabase.storage.from("store-assets").remove([path]);
}

function revalidateOperations() {
  revalidatePath("/", "layout");
  revalidatePath("/faq");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/content");
  revalidatePath("/dashboard/content/banners");
  revalidatePath("/dashboard/content/testimonials");
  revalidatePath("/dashboard/content/faqs");
  revalidatePath("/dashboard/content/store-profile");
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/inventory");
  revalidateTag("storefront-settings", "max");
}

export async function updateOrderStatusAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  if (!(await getAdminSession())) return { ok: false, error: { code: "UNAUTHORIZED", message: "Sesi admin berakhir. Silakan masuk kembali." } };
  const parsed = orderStatusUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: { code: "VALIDATION_ERROR", message: "Periksa status dan catatan pesanan.", fieldErrors: fieldErrors(parsed.error) } };
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_order_status", {
    p_order_id: parsed.data.order_id,
    p_status: parsed.data.status,
    p_note: parsed.data.note ?? null,
  });
  if (error) return { ok: false, error: mapDatabaseError(error, "Status pesanan belum dapat diperbarui.") };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${parsed.data.order_id}`);
  return { ok: true, data: { id: parsed.data.order_id } };
}

export async function createExternalOrderAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  if (!(await getAdminSession())) return { ok: false, error: { code: "UNAUTHORIZED", message: "Sesi admin berakhir. Silakan masuk kembali." } };
  const parsed = externalOrderSchema.safeParse(input);
  if (!parsed.success) return {
    ok: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "Periksa pelanggan, kanal, dan item pesanan.",
      fieldErrors: fieldErrors(parsed.error),
    },
  };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_external_order", { p_payload: parsed.data });
  if (error) return { ok: false, error: mapDatabaseError(error, "Pesanan eksternal belum dapat dicatat.") };
  const id = String(data);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/inventory");
  return { ok: true, data: { id } };
}

export async function updateExternalPaymentStatusAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  if (!(await getAdminSession())) return { ok: false, error: { code: "UNAUTHORIZED", message: "Sesi admin berakhir. Silakan masuk kembali." } };
  const parsed = externalPaymentUpdateSchema.safeParse(input);
  if (!parsed.success) return {
    ok: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "Periksa status, referensi, dan catatan pembayaran.",
      fieldErrors: fieldErrors(parsed.error),
    },
  };
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_external_payment_status", {
    p_order_id: parsed.data.order_id,
    p_status: parsed.data.status,
    p_reference: parsed.data.reference ?? null,
    p_note: parsed.data.note ?? null,
  });
  if (error) return { ok: false, error: mapDatabaseError(error, "Status pembayaran belum dapat diperbarui.") };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${parsed.data.order_id}`);
  revalidatePath("/dashboard/inventory");
  return { ok: true, data: { id: parsed.data.order_id } };
}

export async function saveBannerAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  if (!(await getAdminSession())) return { ok: false, error: { code: "UNAUTHORIZED", message: "Sesi admin berakhir." } };
  const parsed = bannerSchema.safeParse({
    id: value(formData, "id") || undefined,
    title: value(formData, "title"), subtitle: value(formData, "subtitle"),
    link_label: value(formData, "link_label"), link_url: value(formData, "link_url"),
    starts_at: value(formData, "starts_at"), ends_at: value(formData, "ends_at"),
    is_active: checked(formData, "is_active"), sort_order: value(formData, "sort_order"),
  });
  if (!parsed.success) return { ok: false, error: { code: "VALIDATION_ERROR", message: "Periksa kembali data banner.", fieldErrors: fieldErrors(parsed.error) } };
  const upload = await uploadStoreAsset(formData, "image", "banners");
  if (upload.error) return { ok: false, error: { code: "VALIDATION_ERROR", message: upload.error } };
  const id = parsed.data.id ?? crypto.randomUUID();
  const supabase = await createClient();
  const { error } = await supabase.rpc("save_banner", { p_id: id, p_payload: { ...parsed.data, starts_at: jakartaDateTime(parsed.data.starts_at), ends_at: jakartaDateTime(parsed.data.ends_at), image_path: upload.path ?? value(formData, "existing_image_path") } });
  if (error) { await cleanupAsset(upload.path); return { ok: false, error: mapDatabaseError(error, "Banner belum dapat disimpan.") }; }
  revalidateOperations();
  return { ok: true, data: { id } };
}

export async function saveTestimonialAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  if (!(await getAdminSession())) return { ok: false, error: { code: "UNAUTHORIZED", message: "Sesi admin berakhir." } };
  const parsed = testimonialSchema.safeParse({
    id: value(formData, "id") || undefined,
    author_name: value(formData, "author_name"), author_title: value(formData, "author_title"),
    quote: value(formData, "quote"), rating: value(formData, "rating"),
    has_consent: checked(formData, "has_consent"), is_active: checked(formData, "is_active"),
    sort_order: value(formData, "sort_order"),
  });
  if (!parsed.success) return { ok: false, error: { code: "VALIDATION_ERROR", message: "Periksa kembali data testimoni.", fieldErrors: fieldErrors(parsed.error) } };
  const upload = await uploadStoreAsset(formData, "image", "testimonials");
  if (upload.error) return { ok: false, error: { code: "VALIDATION_ERROR", message: upload.error } };
  const id = parsed.data.id ?? crypto.randomUUID();
  const supabase = await createClient();
  const { error } = await supabase.rpc("save_testimonial", { p_id: id, p_payload: { ...parsed.data, image_path: upload.path ?? value(formData, "existing_image_path") } });
  if (error) { await cleanupAsset(upload.path); return { ok: false, error: mapDatabaseError(error, "Testimoni belum dapat disimpan.") }; }
  revalidateOperations();
  return { ok: true, data: { id } };
}

export async function saveFaqAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  if (!(await getAdminSession())) return { ok: false, error: { code: "UNAUTHORIZED", message: "Sesi admin berakhir." } };
  const parsed = faqSchema.safeParse({
    id: value(formData, "id") || undefined,
    question: value(formData, "question"), answer: value(formData, "answer"),
    is_active: checked(formData, "is_active"), sort_order: value(formData, "sort_order"),
  });
  if (!parsed.success) return { ok: false, error: { code: "VALIDATION_ERROR", message: "Periksa kembali data FAQ.", fieldErrors: fieldErrors(parsed.error) } };
  const id = parsed.data.id ?? crypto.randomUUID();
  const supabase = await createClient();
  const { error } = await supabase.rpc("save_faq", { p_id: id, p_payload: parsed.data });
  if (error) return { ok: false, error: mapDatabaseError(error, "FAQ belum dapat disimpan.") };
  revalidateOperations();
  return { ok: true, data: { id } };
}

export async function archiveContentAction(entity: ContentType, id: string): Promise<ActionResult<{ id: string }>> {
  if (!(await getAdminSession())) return { ok: false, error: { code: "UNAUTHORIZED", message: "Sesi admin berakhir." } };
  if (!(["banner", "testimonial", "faq"] as const).includes(entity) || !/^[0-9a-f-]{36}$/i.test(id)) {
    return { ok: false, error: { code: "VALIDATION_ERROR", message: "Konten tidak valid." } };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("archive_operational_content", { p_entity: entity, p_id: id });
  if (error) return { ok: false, error: mapDatabaseError(error, "Konten belum dapat diarsipkan.") };
  revalidateOperations();
  return { ok: true, data: { id } };
}

export async function updateStoreSettingsAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await getAdminSession();
  if (!session) return { ok: false, error: { code: "UNAUTHORIZED", message: "Sesi admin berakhir." } };
  const parsed = storeSettingsSchema.safeParse({
    store_name: value(formData, "store_name"), tagline: value(formData, "tagline"), description: value(formData, "description"),
    contact_email: value(formData, "contact_email"), contact_phone: value(formData, "contact_phone"), whatsapp_number: value(formData, "whatsapp_number"),
    address: value(formData, "address"), business_hours: value(formData, "business_hours"),
    facebook_url: value(formData, "facebook_url"), instagram_url: value(formData, "instagram_url"),
    currency: "IDR", timezone: "Asia/Jakarta", flat_shipping_fee: value(formData, "flat_shipping_fee"), low_stock_threshold: value(formData, "low_stock_threshold"),
    seo_title: value(formData, "seo_title"), seo_description: value(formData, "seo_description"),
  });
  if (!parsed.success) return { ok: false, error: { code: "VALIDATION_ERROR", message: "Periksa kembali profil dan pengaturan toko.", fieldErrors: fieldErrors(parsed.error) } };
  const [logo, favicon] = await Promise.all([
    uploadStoreAsset(formData, "logo", "identity"),
    uploadStoreAsset(formData, "favicon", "identity"),
  ]);
  if (logo.error || favicon.error) {
    await Promise.all([cleanupAsset(logo.path), cleanupAsset(favicon.path)]);
    return { ok: false, error: { code: "VALIDATION_ERROR", message: logo.error ?? favicon.error ?? "Aset belum dapat diunggah." } };
  }
  const payload: StoreSettingsPayload = {
    store_name: parsed.data.store_name,
    tagline: parsed.data.tagline ?? null,
    description: parsed.data.description ?? null,
    contact_email: parsed.data.contact_email ?? null,
    contact_phone: parsed.data.contact_phone ?? null,
    whatsapp_number: parsed.data.whatsapp_number ?? null,
    address: parsed.data.address ?? null,
    business_hours: parsed.data.business_hours ? { summary: parsed.data.business_hours } : null,
    facebook_url: parsed.data.facebook_url ?? null,
    instagram_url: parsed.data.instagram_url ?? null,
    currency: "IDR",
    timezone: "Asia/Jakarta",
    flat_shipping_fee: parsed.data.flat_shipping_fee,
    low_stock_threshold: parsed.data.low_stock_threshold,
    seo_title: parsed.data.seo_title ?? null,
    seo_description: parsed.data.seo_description ?? null,
    logo_path: logo.path ?? (value(formData, "existing_logo_path") || null),
    favicon_path: favicon.path ?? (value(formData, "existing_favicon_path") || null),
  };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("save_store_settings", { p_payload: payload });
  if (error) {
    if (isMissingStoreSettingsRpc(error)) {
      const fallback = await saveStoreSettingsWithoutRpc(supabase, payload, session.profile.id);
      if (fallback.ok) {
        revalidateOperations();
        return fallback;
      }
      await Promise.all([cleanupAsset(logo.path), cleanupAsset(favicon.path)]);
      return fallback;
    }
    await Promise.all([cleanupAsset(logo.path), cleanupAsset(favicon.path)]);
    return { ok: false, error: mapDatabaseError(error, "Profil toko belum dapat disimpan.") };
  }
  revalidateOperations();
  return { ok: true, data: { id: String(data) } };
}
