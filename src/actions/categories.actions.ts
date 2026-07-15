"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath, revalidateTag } from "next/cache";

import { getAdminSession } from "@/lib/auth/get-admin-session";
import { createSlug } from "@/lib/slug";
import { broadcastCatalogChange } from "@/lib/supabase/catalog-realtime";
import { createClient } from "@/lib/supabase/server";
import type { ActionError, ActionResult } from "@/types/action-result";
import { categoryFormSchema, type CategoryFormValues } from "@/validations/category.schema";
import { databaseUuidSchema } from "@/validations/database.schema";

type CategoryRow = {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

function mapCategoryError(error: { code?: string; message: string }): ActionError {
  if (error.code === "PGRST202" || error.message.includes("catalog_category")) {
    return {
      code: "CONFIGURATION_ERROR",
      message: "Migration katalog Fase 3 belum diterapkan pada database Supabase.",
    };
  }

  if (error.code === "23505") {
    return {
      code: "CONFLICT",
      message: "Slug kategori sudah digunakan.",
      fieldErrors: { slug: ["Gunakan slug yang berbeda."] },
    };
  }
  if (error.code === "23514") return { code: "VALIDATION_ERROR", message: error.message };
  if (error.code === "23503") return { code: "VALIDATION_ERROR", message: "Kategori induk tidak tersedia." };
  if (error.code === "P0002") return { code: "NOT_FOUND", message: "Kategori tidak ditemukan." };
  if (error.code === "42501") return { code: "FORBIDDEN", message: "Anda tidak memiliki izin untuk mengelola kategori." };
  return { code: "INTERNAL_ERROR", message: "Kategori belum dapat disimpan. Silakan coba lagi." };
}

function isMissingCatalogRpc(error: { code?: string; message: string }) {
  return error.code === "PGRST202" || error.message.includes("catalog_category");
}

async function validateHierarchy(
  supabase: SupabaseClient,
  categoryId: string,
  parentId?: string,
): Promise<ActionError | null> {
  if (!parentId) return null;
  if (parentId === categoryId) return { code: "VALIDATION_ERROR", message: "Kategori tidak dapat menjadi induknya sendiri." };

  const { data, error } = await supabase
    .from("categories")
    .select("id, parent_id")
    .is("deleted_at", null);
  if (error) return mapCategoryError(error);

  const parents = new Map(((data ?? []) as { id: string; parent_id: string | null }[]).map((row) => [row.id, row.parent_id]));
  if (!parents.has(parentId)) return { code: "VALIDATION_ERROR", message: "Kategori induk tidak tersedia." };

  const visited = new Set<string>();
  let current: string | null | undefined = parentId;
  while (current) {
    if (current === categoryId) return { code: "VALIDATION_ERROR", message: "Hierarki kategori akan membentuk siklus." };
    if (visited.has(current)) return { code: "VALIDATION_ERROR", message: "Hierarki kategori yang tersimpan tidak valid." };
    visited.add(current);
    current = parents.get(current);
  }
  return null;
}

async function saveCategoryWithoutRpc(
  supabase: SupabaseClient,
  id: string,
  values: CategoryFormValues,
  actorId: string,
): Promise<ActionResult<{ id: string }>> {
  const hierarchyError = await validateHierarchy(supabase, id, values.parent_id);
  if (hierarchyError) return { ok: false, error: hierarchyError };

  const { data: existing, error: existingError } = await supabase
    .from("categories")
    .select("id, parent_id, name, slug, description, icon, is_active, sort_order, created_by, updated_by, created_at, updated_at, deleted_at")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (existingError) return { ok: false, error: mapCategoryError(existingError) };

  const before = existing as CategoryRow | null;
  const payload = {
    parent_id: values.parent_id ?? null,
    name: values.name,
    slug: values.slug,
    description: values.description ?? null,
    icon: values.icon ?? null,
    is_active: values.is_active,
    sort_order: values.sort_order,
    updated_by: actorId,
  };

  const mutation = before
    ? supabase.from("categories").update(payload).eq("id", id).is("deleted_at", null)
    : supabase.from("categories").insert({ id, ...payload, created_by: actorId });
  const { data: saved, error: saveError } = await mutation
    .select("id, parent_id, name, slug, description, icon, is_active, sort_order, created_by, updated_by, created_at, updated_at, deleted_at")
    .single();
  if (saveError) return { ok: false, error: mapCategoryError(saveError) };

  const { error: logError } = await supabase.from("activity_logs").insert({
    actor_id: actorId,
    action: before ? "category.updated" : "category.created",
    entity_type: "category",
    entity_id: id,
    before_data: before,
    after_data: saved,
  });

  if (logError) {
    if (before) {
      await supabase.from("categories").update({
        parent_id: before.parent_id,
        name: before.name,
        slug: before.slug,
        description: before.description,
        icon: before.icon,
        is_active: before.is_active,
        sort_order: before.sort_order,
        updated_by: before.updated_by,
      }).eq("id", id);
    } else {
      await supabase.from("categories").delete().eq("id", id);
    }
    return { ok: false, error: { code: "INTERNAL_ERROR", message: "Kategori tidak disimpan karena activity log gagal dibuat." } };
  }

  return { ok: true, data: { id } };
}

async function archiveCategoryWithoutRpc(
  supabase: SupabaseClient,
  id: string,
  actorId: string,
): Promise<ActionResult<{ id: string }>> {
  const { data: before, error: readError } = await supabase
    .from("categories")
    .select("id, parent_id, name, slug, description, icon, is_active, sort_order, created_by, updated_by, created_at, updated_at, deleted_at")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (readError) return { ok: false, error: mapCategoryError(readError) };
  if (!before) return { ok: false, error: { code: "NOT_FOUND", message: "Kategori tidak ditemukan." } };

  const { data: children, error: childrenError } = await supabase
    .from("categories")
    .select("id, parent_id")
    .eq("parent_id", id)
    .is("deleted_at", null);
  if (childrenError) return { ok: false, error: mapCategoryError(childrenError) };

  const childIds = (children ?? []).map((child) => child.id);
  if (childIds.length) {
    const { error } = await supabase.from("categories").update({ parent_id: null, updated_by: actorId }).in("id", childIds);
    if (error) return { ok: false, error: mapCategoryError(error) };
  }

  const { data: after, error: archiveError } = await supabase
    .from("categories")
    .update({ is_active: false, deleted_at: new Date().toISOString(), updated_by: actorId })
    .eq("id", id)
    .select("id, parent_id, name, slug, description, icon, is_active, sort_order, created_by, updated_by, created_at, updated_at, deleted_at")
    .single();
  if (archiveError) {
    if (childIds.length) {
      await supabase.from("categories").update({ parent_id: id, updated_by: actorId }).in("id", childIds);
    }
    return { ok: false, error: mapCategoryError(archiveError) };
  }

  const { error: logError } = await supabase.from("activity_logs").insert({
    actor_id: actorId,
    action: "category.archived",
    entity_type: "category",
    entity_id: id,
    before_data: before,
    after_data: after,
  });
  if (logError) {
    await supabase.from("categories").update({
      parent_id: before.parent_id,
      name: before.name,
      slug: before.slug,
      description: before.description,
      icon: before.icon,
      is_active: before.is_active,
      sort_order: before.sort_order,
      updated_by: before.updated_by,
      deleted_at: before.deleted_at,
    }).eq("id", id);
    if (childIds.length) {
      await supabase.from("categories").update({ parent_id: id, updated_by: actorId }).in("id", childIds);
    }
    return { ok: false, error: { code: "INTERNAL_ERROR", message: "Kategori tidak diarsipkan karena activity log gagal dibuat." } };
  }

  return { ok: true, data: { id } };
}

function revalidateCategoryPages() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/products/new");
  revalidateTag("categories", "max");
}

export async function saveCategoryAction(
  categoryId: string | null,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Sesi admin berakhir. Silakan masuk kembali." } };
  }

  const parsedId = categoryId ? databaseUuidSchema.safeParse(categoryId) : null;
  const preparedInput = categoryId === null && input && typeof input === "object"
    ? {
        ...(input as Record<string, unknown>),
        slug: createSlug(String((input as Record<string, unknown>).name ?? "")),
      }
    : input;
  const parsed = categoryFormSchema.safeParse(preparedInput);
  if ((parsedId && !parsedId.success) || !parsed.success) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Periksa kembali data kategori.",
        fieldErrors: parsed.success ? undefined : (parsed.error.flatten().fieldErrors as Record<string, string[]>),
      },
    };
  }

  const id = parsedId?.data ?? crypto.randomUUID();
  const supabase = await createClient();
  const { error } = await supabase.rpc("save_catalog_category", {
    p_category_id: id,
    p_category: {
      ...parsed.data,
      description: parsed.data.description ?? "",
      icon: parsed.data.icon ?? "",
      parent_id: parsed.data.parent_id ?? "",
    },
  });

  let result: ActionResult<{ id: string }>;
  if (!error) result = { ok: true, data: { id } };
  else if (isMissingCatalogRpc(error)) result = await saveCategoryWithoutRpc(supabase, id, parsed.data, session.profile.id);
  else result = { ok: false, error: mapCategoryError(error) };

  if (result.ok) {
    revalidateCategoryPages();
    await broadcastCatalogChange({ entity: "category", operation: "created_or_updated", id });
  }
  return result;
}

export async function archiveCategoryAction(categoryId: string): Promise<ActionResult<{ id: string }>> {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Sesi admin berakhir." } };
  }

  const parsedId = databaseUuidSchema.safeParse(categoryId);
  if (!parsedId.success) {
    return { ok: false, error: { code: "VALIDATION_ERROR", message: "ID kategori tidak valid." } };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("archive_catalog_category", { p_category_id: parsedId.data });

  let result: ActionResult<{ id: string }>;
  if (!error) result = { ok: true, data: { id: parsedId.data } };
  else if (isMissingCatalogRpc(error)) {
    result = await archiveCategoryWithoutRpc(supabase, parsedId.data, session.profile.id);
  } else result = { ok: false, error: mapCategoryError(error) };

  if (result.ok) {
    revalidateCategoryPages();
    await broadcastCatalogChange({ entity: "category", operation: "archived", id: parsedId.data });
  }
  return result;
}
