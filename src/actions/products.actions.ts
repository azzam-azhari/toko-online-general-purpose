"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { getAdminSession } from "@/lib/auth/get-admin-session";
import { broadcastCatalogChange } from "@/lib/supabase/catalog-realtime";
import { createClient } from "@/lib/supabase/server";
import { createShortDescription } from "@/lib/text";
import type { ActionError, ActionResult } from "@/types/action-result";
import type { ProductStatus } from "@/types/catalog";
import { databaseUuidSchema } from "@/validations/database.schema";
import { productFormSchema, type ProductFormValues } from "@/validations/product.schema";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_PRODUCT_IMAGES = 10;
const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/avif": "avif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

type SaveProductResult = {
  id: string;
  status: ProductStatus;
  warning?: string;
};

type UploadedImage = {
  storage_path: string;
  public_url: string;
  alt_text: string;
  sort_order: number;
};

type ProductDatabaseRow = Record<string, unknown> & {
  id: string;
  status: ProductStatus;
};

type ProductImageDatabaseRow = {
  id: string;
  product_id: string;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

const PRODUCT_SELECT =
  "id, name, slug, sku, short_description, description, price, compare_at_price, stock, reserved_stock, status, is_featured, sort_order, seo_title, seo_description, cta_type, cta_label, custom_url, whatsapp_number, whatsapp_template, open_in_new_tab, midtrans_enabled, created_by, updated_by, created_at, updated_at, deleted_at";

const PRODUCT_IMAGE_SELECT =
  "id, product_id, storage_path, alt_text, sort_order, is_primary, created_by, updated_by, created_at, updated_at";

function fieldErrors(error: z.ZodError): Record<string, string[]> {
  return error.flatten().fieldErrors as Record<string, string[]>;
}

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "true" || formData.get(key) === "on";
}

function parseProductForm(formData: FormData, generateShortDescription: boolean) {
  const description = String(formData.get("description") ?? "");

  return productFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    sku: formData.get("sku"),
    short_description: generateShortDescription
      ? createShortDescription(description)
      : (formData.get("short_description") ?? ""),
    description,
    price: formData.get("price"),
    compare_at_price: formData.get("compare_at_price") ?? "",
    stock: formData.get("stock"),
    status: formData.get("status"),
    is_featured: getBoolean(formData, "is_featured"),
    sort_order: formData.get("sort_order") ?? 0,
    seo_title: formData.get("seo_title") ?? "",
    seo_description: formData.get("seo_description") ?? "",
    cta_type: formData.get("cta_type"),
    cta_label: formData.get("cta_label"),
    custom_url: formData.get("custom_url") ?? "",
    whatsapp_number: formData.get("whatsapp_number") ?? "",
    whatsapp_template: formData.get("whatsapp_template") ?? "",
    open_in_new_tab: getBoolean(formData, "open_in_new_tab"),
    category_ids: formData.getAll("category_ids"),
  });
}

function getFiles(formData: FormData) {
  return formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);
}

function validateFiles(files: File[]): string | null {
  for (const file of files) {
    if (!IMAGE_EXTENSIONS[file.type]) return "Gunakan gambar AVIF, JPEG, PNG, atau WebP.";
    if (file.size > MAX_IMAGE_SIZE) return "Ukuran setiap gambar maksimal 5 MB.";
  }
  return null;
}

async function hasValidImageSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const startsWith = (...signature: number[]) => signature.every((byte, index) => bytes[index] === byte);

  if (file.type === "image/jpeg") return startsWith(0xff, 0xd8, 0xff);
  if (file.type === "image/png") return startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
  if (file.type === "image/webp") {
    return startsWith(0x52, 0x49, 0x46, 0x46) && bytes.slice(8, 12).every((byte, index) => byte === [0x57, 0x45, 0x42, 0x50][index]);
  }
  if (file.type === "image/avif") {
    const fileType = String.fromCharCode(...bytes.slice(4, 8));
    const brand = String.fromCharCode(...bytes.slice(8, 12));
    return fileType === "ftyp" && ["avif", "avis"].includes(brand);
  }
  return false;
}

async function removeUploadedImages(paths: string[]) {
  if (paths.length === 0) return;
  const supabase = await createClient();
  await supabase.storage.from("product-images").remove(paths);
}

async function uploadImages(
  productId: string,
  productName: string,
  files: File[],
  startSortOrder: number,
): Promise<ActionResult<UploadedImage[]>> {
  const supabase = await createClient();
  const uploaded: UploadedImage[] = [];

  for (const [index, file] of files.entries()) {
    if (!(await hasValidImageSignature(file))) {
      await removeUploadedImages(uploaded.map((image) => image.storage_path));
      return {
        ok: false,
        error: { code: "UPLOAD_ERROR", message: "Isi file tidak sesuai dengan tipe gambar yang dipilih." },
      };
    }

    const extension = IMAGE_EXTENSIONS[file.type];
    const storagePath = `${productId}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("product-images").upload(storagePath, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      await removeUploadedImages(uploaded.map((image) => image.storage_path));
      return {
        ok: false,
        error: { code: "UPLOAD_ERROR", message: "Gambar belum dapat diunggah. Silakan coba lagi." },
      };
    }

    const { data: publicUrlData } = supabase.storage.from("product-images").getPublicUrl(storagePath);
    const publicUrl = publicUrlData.publicUrl;
    const validPublicUrl = z.url().safeParse(publicUrl);

    if (!validPublicUrl.success || new URL(validPublicUrl.data).protocol !== "https:") {
      await removeUploadedImages([...uploaded.map((image) => image.storage_path), storagePath]);
      return {
        ok: false,
        error: { code: "UPLOAD_ERROR", message: "URL gambar dari storage tidak valid. Data belum disimpan." },
      };
    }

    uploaded.push({
      storage_path: storagePath,
      public_url: validPublicUrl.data,
      alt_text: productName,
      sort_order: startSortOrder + index,
    });
  }

  return { ok: true, data: uploaded };
}

function mapDatabaseError(error: { code?: string; message: string }): ActionError {
  if (error.code === "PGRST202" || error.message.includes("save_catalog_product")) {
    return {
      code: "CONFIGURATION_ERROR",
      message: "Migration katalog Fase 3 belum diterapkan pada database Supabase.",
    };
  }

  if (error.code === "23505") {
    if (error.message.includes("sku")) {
      return {
        code: "CONFLICT",
        message: "SKU sudah digunakan produk lain.",
        fieldErrors: { sku: ["Gunakan SKU yang berbeda."] },
      };
    }
    return {
      code: "CONFLICT",
      message: "Slug sudah digunakan.",
      fieldErrors: { slug: ["Gunakan slug yang berbeda."] },
    };
  }

  if (error.code === "23503") {
    return { code: "VALIDATION_ERROR", message: "Salah satu kategori sudah tidak tersedia." };
  }

  if (error.code === "P0002") {
    return { code: "NOT_FOUND", message: "Produk tidak ditemukan." };
  }

  if (error.code === "42501") {
    return { code: "FORBIDDEN", message: "Akun ini tidak memiliki akses untuk mengubah produk." };
  }

  if (error.code === "23514") {
    return {
      code: "VALIDATION_ERROR",
      message: error.message.includes("stock")
        ? "Stok fisik tidak boleh lebih rendah daripada stok yang sedang direservasi."
        : "Data produk tidak memenuhi aturan katalog.",
    };
  }

  return { code: "INTERNAL_ERROR", message: "Produk belum dapat disimpan. Silakan coba lagi." };
}

function isMissingCatalogRpc(error: { code?: string; message: string }) {
  return error.code === "PGRST202" || error.message.includes("catalog_product");
}

function serializeProduct(values: ProductFormValues) {
  return {
    ...values,
    compare_at_price: values.compare_at_price ?? "",
    short_description: values.short_description ?? "",
    description: values.description ?? "",
    seo_title: values.seo_title ?? "",
    seo_description: values.seo_description ?? "",
    custom_url: values.custom_url ?? "",
    whatsapp_number: values.whatsapp_number ?? "",
    whatsapp_template: values.whatsapp_template ?? "",
  };
}

function productPayload(values: ProductFormValues, actorId: string) {
  return {
    name: values.name,
    slug: values.slug,
    sku: values.sku,
    short_description: values.short_description ?? null,
    description: values.description ?? null,
    price: values.price,
    compare_at_price: values.compare_at_price ?? null,
    stock: values.stock,
    status: values.status,
    is_featured: values.is_featured,
    sort_order: values.sort_order,
    seo_title: values.seo_title ?? null,
    seo_description: values.seo_description ?? null,
    cta_type: values.cta_type,
    cta_label: values.cta_label,
    custom_url: values.custom_url ?? null,
    whatsapp_number: values.whatsapp_number ?? null,
    whatsapp_template: values.whatsapp_template ?? null,
    open_in_new_tab: values.open_in_new_tab,
    midtrans_enabled: values.cta_type === "midtrans",
    updated_by: actorId,
  };
}

async function restoreProductState(
  supabase: SupabaseClient,
  productId: string,
  before: ProductDatabaseRow | null,
  categoryIds: string[],
  images: ProductImageDatabaseRow[],
) {
  if (!before) {
    await supabase.from("products").delete().eq("id", productId);
    return;
  }

  const restorePayload: Record<string, unknown> = { ...before };
  delete restorePayload.id;
  delete restorePayload.created_at;
  delete restorePayload.updated_at;
  await supabase.from("products").update(restorePayload).eq("id", productId);
  await supabase.from("product_categories").delete().eq("product_id", productId);
  if (categoryIds.length) {
    await supabase
      .from("product_categories")
      .insert(categoryIds.map((categoryId) => ({ product_id: productId, category_id: categoryId })));
  }
  await supabase.from("product_images").delete().eq("product_id", productId);
  if (images.length) await supabase.from("product_images").insert(images);
}

async function saveProductWithoutRpc(
  supabase: SupabaseClient,
  id: string,
  values: ProductFormValues,
  actorId: string,
  newImages: UploadedImage[],
  deleteImageIds: string[],
): Promise<ActionResult<{ removed_paths: string[] }>> {
  const [{ data: existing, error: existingError }, { data: existingCategories, error: categoryReadError }, { data: existingImages, error: imageReadError }] =
    await Promise.all([
      supabase.from("products").select(PRODUCT_SELECT).eq("id", id).is("deleted_at", null).maybeSingle(),
      supabase.from("product_categories").select("category_id").eq("product_id", id),
      supabase.from("product_images").select(PRODUCT_IMAGE_SELECT).eq("product_id", id),
    ]);

  const readError = existingError ?? categoryReadError ?? imageReadError;
  if (readError) return { ok: false, error: mapDatabaseError(readError) };

  const before = existing as ProductDatabaseRow | null;
  const previousCategoryIds = (existingCategories ?? []).map((row) => row.category_id);
  const previousImages = (existingImages ?? []) as ProductImageDatabaseRow[];

  if (values.category_ids.length) {
    const { data: availableCategories, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .in("id", values.category_ids)
      .is("deleted_at", null);
    if (categoryError) return { ok: false, error: mapDatabaseError(categoryError) };
    if ((availableCategories ?? []).length !== new Set(values.category_ids).size) {
      return { ok: false, error: { code: "VALIDATION_ERROR", message: "Salah satu kategori sudah tidak tersedia." } };
    }
  }

  const payload = productPayload(values, actorId);
  const mutation = before
    ? supabase.from("products").update(payload).eq("id", id).is("deleted_at", null)
    : supabase.from("products").insert({ id, ...payload, created_by: actorId });
  const { data: saved, error: saveError } = await mutation.select(PRODUCT_SELECT).single();
  if (saveError) return { ok: false, error: mapDatabaseError(saveError) };

  const rollback = async () => {
    await restoreProductState(supabase, id, before, previousCategoryIds, previousImages);
  };

  const { error: categoryDeleteError } = await supabase
    .from("product_categories")
    .delete()
    .eq("product_id", id);
  if (categoryDeleteError) {
    await rollback();
    return { ok: false, error: mapDatabaseError(categoryDeleteError) };
  }

  if (values.category_ids.length) {
    const { error: categoryInsertError } = await supabase.from("product_categories").insert(
      [...new Set(values.category_ids)].map((categoryId) => ({ product_id: id, category_id: categoryId })),
    );
    if (categoryInsertError) {
      await rollback();
      return { ok: false, error: mapDatabaseError(categoryInsertError) };
    }
  }

  if (newImages.length) {
    const { error: imageInsertError } = await supabase.from("product_images").insert(
      newImages.map((image) => ({
        product_id: id,
        storage_path: image.storage_path,
        alt_text: image.alt_text,
        sort_order: image.sort_order,
        is_primary: false,
        created_by: actorId,
        updated_by: actorId,
      })),
    );
    if (imageInsertError) {
      await rollback();
      return { ok: false, error: mapDatabaseError(imageInsertError) };
    }
  }

  if (deleteImageIds.length) {
    const { error: imageDeleteError } = await supabase
      .from("product_images")
      .delete()
      .eq("product_id", id)
      .in("id", deleteImageIds);
    if (imageDeleteError) {
      await rollback();
      return { ok: false, error: mapDatabaseError(imageDeleteError) };
    }
  }

  const { data: remainingImages, error: remainingImagesError } = await supabase
    .from("product_images")
    .select("id")
    .eq("product_id", id)
    .order("sort_order")
    .order("created_at")
    .limit(1);
  if (remainingImagesError) {
    await rollback();
    return { ok: false, error: mapDatabaseError(remainingImagesError) };
  }

  const { error: clearPrimaryError } = await supabase
    .from("product_images")
    .update({ is_primary: false, updated_by: actorId })
    .eq("product_id", id)
    .eq("is_primary", true);
  if (clearPrimaryError) {
    await rollback();
    return { ok: false, error: mapDatabaseError(clearPrimaryError) };
  }

  const primaryImageId = remainingImages?.[0]?.id;
  if (primaryImageId) {
    const { error: primaryError } = await supabase
      .from("product_images")
      .update({ is_primary: true, updated_by: actorId })
      .eq("id", primaryImageId);
    if (primaryError) {
      await rollback();
      return { ok: false, error: mapDatabaseError(primaryError) };
    }
  }

  const { error: logError } = await supabase.from("activity_logs").insert({
    actor_id: actorId,
    action: before ? "product.updated" : "product.created",
    entity_type: "product",
    entity_id: id,
    before_data: before,
    after_data: saved,
  });
  if (logError) {
    await rollback();
    return { ok: false, error: { code: "INTERNAL_ERROR", message: "Produk tidak disimpan karena activity log gagal dibuat." } };
  }

  const removedPaths = previousImages
    .filter((image) => deleteImageIds.includes(image.id))
    .map((image) => image.storage_path);
  return { ok: true, data: { removed_paths: removedPaths } };
}

async function setProductStatusWithoutRpc(
  supabase: SupabaseClient,
  productId: string,
  status: Exclude<ProductStatus, "archived">,
  actorId: string,
): Promise<ActionResult<{ id: string }>> {
  const { data: before, error: readError } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", productId)
    .is("deleted_at", null)
    .maybeSingle();
  if (readError) return { ok: false, error: mapDatabaseError(readError) };
  if (!before) return { ok: false, error: { code: "NOT_FOUND", message: "Produk tidak ditemukan." } };

  const { data: after, error: updateError } = await supabase
    .from("products")
    .update({ status, updated_by: actorId })
    .eq("id", productId)
    .is("deleted_at", null)
    .select(PRODUCT_SELECT)
    .single();
  if (updateError) return { ok: false, error: mapDatabaseError(updateError) };

  const { error: logError } = await supabase.from("activity_logs").insert({
    actor_id: actorId,
    action: "product.status_changed",
    entity_type: "product",
    entity_id: productId,
    before_data: before,
    after_data: after,
  });
  if (logError) {
    await supabase.from("products").update({ status: before.status, updated_by: before.updated_by }).eq("id", productId);
    return { ok: false, error: { code: "INTERNAL_ERROR", message: "Status produk tidak diubah karena activity log gagal dibuat." } };
  }

  return { ok: true, data: { id: productId } };
}

async function archiveProductWithoutRpc(
  supabase: SupabaseClient,
  productId: string,
  actorId: string,
): Promise<ActionResult<{ id: string }>> {
  const { data: before, error: readError } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", productId)
    .is("deleted_at", null)
    .maybeSingle();
  if (readError) return { ok: false, error: mapDatabaseError(readError) };
  if (!before) return { ok: false, error: { code: "NOT_FOUND", message: "Produk tidak ditemukan." } };

  const archivedAt = new Date().toISOString();
  const { data: after, error: archiveError } = await supabase
    .from("products")
    .update({ status: "archived", deleted_at: archivedAt, updated_by: actorId })
    .eq("id", productId)
    .is("deleted_at", null)
    .select(PRODUCT_SELECT)
    .single();
  if (archiveError) return { ok: false, error: mapDatabaseError(archiveError) };

  const { error: logError } = await supabase.from("activity_logs").insert({
    actor_id: actorId,
    action: "product.archived",
    entity_type: "product",
    entity_id: productId,
    before_data: before,
    after_data: after,
  });
  if (logError) {
    await supabase
      .from("products")
      .update({ status: before.status, deleted_at: before.deleted_at, updated_by: before.updated_by })
      .eq("id", productId);
    return { ok: false, error: { code: "INTERNAL_ERROR", message: "Produk tidak diarsipkan karena activity log gagal dibuat." } };
  }

  return { ok: true, data: { id: productId } };
}

export async function saveProductAction(
  productId: string | null,
  formData: FormData,
): Promise<ActionResult<SaveProductResult>> {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Sesi admin berakhir. Silakan masuk kembali." } };
  }

  const parsedId = productId ? databaseUuidSchema.safeParse(productId) : null;
  if (parsedId && !parsedId.success) {
    return { ok: false, error: { code: "VALIDATION_ERROR", message: "ID produk tidak valid." } };
  }

  const parsed = parseProductForm(formData, productId === null);
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Periksa kembali data produk.",
        fieldErrors: fieldErrors(parsed.error),
      },
    };
  }

  const id = parsedId?.data ?? crypto.randomUUID();
  const files = getFiles(formData);
  const fileError = validateFiles(files);
  if (fileError) {
    return {
      ok: false,
      error: { code: "VALIDATION_ERROR", message: fileError, fieldErrors: { images: [fileError] } },
    };
  }

  const deleteImageIds = formData
    .getAll("delete_image_ids")
    .filter((value): value is string => typeof value === "string" && databaseUuidSchema.safeParse(value).success);

  const supabase = await createClient();
  const { data: currentImages, error: currentImagesError } = await supabase
    .from("product_images")
    .select("id")
    .eq("product_id", id);

  if (currentImagesError) {
    return { ok: false, error: { code: "INTERNAL_ERROR", message: "Data gambar produk belum dapat diperiksa." } };
  }

  const currentImageIds = new Set((currentImages ?? []).map((image) => image.id));
  const validDeleteIds = [...new Set(deleteImageIds.filter((imageId) => currentImageIds.has(imageId)))];
  const remainingImageCount = currentImageIds.size - validDeleteIds.length;

  if (remainingImageCount + files.length > MAX_PRODUCT_IMAGES) {
    const message = `Satu produk maksimal memiliki ${MAX_PRODUCT_IMAGES} gambar.`;
    return {
      ok: false,
      error: { code: "VALIDATION_ERROR", message, fieldErrors: { images: [message] } },
    };
  }

  const uploadResult = await uploadImages(id, parsed.data.name, files, remainingImageCount);
  if (!uploadResult.ok) return uploadResult;

  const { data, error } = await supabase.rpc("save_catalog_product", {
    p_product_id: id,
    p_product: serializeProduct(parsed.data),
    p_category_ids: parsed.data.category_ids,
    p_new_images: uploadResult.data,
    p_delete_image_ids: validDeleteIds,
  });

  let removedPaths: string[] = [];
  if (error && isMissingCatalogRpc(error)) {
    const fallback = await saveProductWithoutRpc(
      supabase,
      id,
      parsed.data,
      session.profile.id,
      uploadResult.data,
      validDeleteIds,
    );
    if (!fallback.ok) {
      await removeUploadedImages(uploadResult.data.map((image) => image.storage_path));
      return fallback;
    }
    removedPaths = fallback.data.removed_paths;
  } else if (error) {
    await removeUploadedImages(uploadResult.data.map((image) => image.storage_path));
    return { ok: false, error: mapDatabaseError(error) };
  } else {
    const rpcResult = data as { removed_paths?: string[] } | null;
    removedPaths = rpcResult?.removed_paths ?? [];
  }

  let warning: string | undefined;
  if (removedPaths.length) {
    const { error: cleanupError } = await supabase.storage
      .from("product-images")
      .remove(removedPaths);
    if (cleanupError) warning = "Produk tersimpan, tetapi satu file lama belum dapat dibersihkan.";
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/products");
  revalidatePath(`/dashboard/products/${id}/edit`);
  revalidateTag("products", "max");

  const realtimeDelivered = await broadcastCatalogChange({
    entity: "product",
    operation: "created_or_updated",
    id,
  });
  if (!realtimeDelivered) {
    warning = warning
      ? `${warning} Pembaruan realtime belum terkirim.`
      : "Produk tersimpan, tetapi pembaruan realtime belum terkirim.";
  }

  return { ok: true, data: { id, status: parsed.data.status, warning } };
}

export async function setProductStatusAction(
  productId: string,
  status: Exclude<ProductStatus, "archived">,
): Promise<ActionResult<{ id: string }>> {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Sesi admin berakhir." } };
  }

  const parsed = z.object({ id: databaseUuidSchema, status: z.enum(["draft", "active", "inactive"]) }).safeParse({
    id: productId,
    status,
  });
  if (!parsed.success) {
    return { ok: false, error: { code: "VALIDATION_ERROR", message: "Status produk tidak valid." } };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_catalog_product_status", {
    p_product_id: parsed.data.id,
    p_status: parsed.data.status,
  });

  if (error && isMissingCatalogRpc(error)) {
    const fallback = await setProductStatusWithoutRpc(
      supabase,
      parsed.data.id,
      parsed.data.status,
      session.profile.id,
    );
    if (!fallback.ok) return fallback;
  } else if (error) return { ok: false, error: mapDatabaseError(error) };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/products");
  revalidateTag("products", "max");
  await broadcastCatalogChange({ entity: "product", operation: "status_changed", id: parsed.data.id });
  return { ok: true, data: { id: parsed.data.id } };
}

export async function archiveProductAction(productId: string): Promise<ActionResult<{ id: string }>> {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Sesi admin berakhir." } };
  }

  const parsedId = databaseUuidSchema.safeParse(productId);
  if (!parsedId.success) {
    return { ok: false, error: { code: "VALIDATION_ERROR", message: "ID produk tidak valid." } };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("archive_catalog_product", { p_product_id: parsedId.data });
  if (error && isMissingCatalogRpc(error)) {
    const fallback = await archiveProductWithoutRpc(
      supabase,
      parsedId.data,
      session.profile.id,
    );
    if (!fallback.ok) return fallback;
  } else if (error) return { ok: false, error: mapDatabaseError(error) };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/products");
  revalidateTag("products", "max");
  await broadcastCatalogChange({ entity: "product", operation: "archived", id: parsedId.data });
  return { ok: true, data: { id: parsedId.data } };
}
