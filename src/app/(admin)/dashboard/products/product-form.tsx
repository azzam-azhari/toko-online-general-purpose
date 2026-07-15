"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Loader2, Save, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { type FieldPath, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { saveProductAction } from "@/actions/products.actions";
import { ProductImageUploader } from "@/components/common/product-image-uploader";
import { ProductPreview } from "@/components/common/product-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createSlug } from "@/lib/slug";
import { createShortDescription } from "@/lib/text";
import type { Category, Product } from "@/types/catalog";
import {
  productFormSchema,
  type ProductFormInput,
  type ProductFormValues,
} from "@/validations/product.schema";

type ProductFormProps = {
  categories: Category[];
  product?: Product;
};

const DEFAULT_WHATSAPP_TEMPLATE =
  "Pagi, Kak. Saya tertarik dengan {product_name} ini. Harganya {product_price}. Berikut detail produknya: {product_url}. SKU: {product_sku}.";

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1.5 text-sm text-destructive">{message}</p> : null;
}

function FieldHelp({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{children}</p>;
}

function firstErrorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  if ("message" in error && typeof error.message === "string") return error.message;

  for (const value of Object.values(error)) {
    const message = firstErrorMessage(value);
    if (message) return message;
  }
  return undefined;
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-sans text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [slugManual, setSlugManual] = useState(Boolean(product));

  const form = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    shouldFocusError: false,
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      sku: product?.sku ?? "",
      short_description: product?.short_description ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      compare_at_price: product?.compare_at_price ?? "",
      stock: product?.stock ?? 0,
      status: product?.status === "archived" ? "draft" : (product?.status ?? "draft"),
      is_featured: product?.is_featured ?? false,
      sort_order: product?.sort_order ?? 0,
      seo_title: product?.seo_title ?? "",
      seo_description: product?.seo_description ?? "",
      cta_type: product?.cta_type ?? "whatsapp",
      cta_label: product?.cta_label ?? "Beli Sekarang",
      custom_url: product?.custom_url ?? "",
      whatsapp_number: product?.whatsapp_number ?? "",
      whatsapp_template: product
        ? (product.whatsapp_template ?? "")
        : DEFAULT_WHATSAPP_TEMPLATE,
      open_in_new_tab: product?.open_in_new_tab ?? false,
      category_ids: product?.category_ids ?? [],
    },
  });

  const watchedName = useWatch({ control: form.control, name: "name" });
  const watchedSlug = useWatch({ control: form.control, name: "slug" });
  const watchedDescription = useWatch({ control: form.control, name: "description" });
  const watchedCtaType = useWatch({ control: form.control, name: "cta_type" });
  const watchedValues = useWatch({ control: form.control });
  const previewUrl = useMemo(() => (files[0] ? URL.createObjectURL(files[0]) : undefined), [files]);
  const existingPreview = product?.product_images.find((image) => !deletedImageIds.includes(image.id))?.url;

  useEffect(() => {
    if (!slugManual) form.setValue("slug", createSlug(String(watchedName ?? "")), { shouldValidate: false });
  }, [form, slugManual, watchedName]);

  useEffect(() => {
    if (!product) {
      form.setValue("short_description", createShortDescription(String(watchedDescription ?? "")), {
        shouldValidate: false,
      });
    }
  }, [form, product, watchedDescription]);

  useEffect(() => {
    const currentTemplate = String(form.getValues("whatsapp_template") ?? "").trim();
    if (!product && watchedCtaType === "whatsapp" && !currentTemplate) {
      form.setValue("whatsapp_template", DEFAULT_WHATSAPP_TEMPLATE, { shouldValidate: false });
    }
  }, [form, product, watchedCtaType]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  async function submit(values: ProductFormValues, intent: "draft" | "publish") {
    setPending(true);
    const formData = new FormData();
    const status = intent === "publish" ? "active" : "draft";
    const payload = { ...values, status };

    for (const [key, value] of Object.entries(payload)) {
      if (key === "category_ids") continue;
      if (typeof value === "boolean") formData.set(key, String(value));
      else formData.set(key, value === undefined || value === null ? "" : String(value));
    }
    values.category_ids.forEach((id) => formData.append("category_ids", id));
    files.forEach((file) => formData.append("images", file));
    deletedImageIds.forEach((id) => formData.append("delete_image_ids", id));

    let result: Awaited<ReturnType<typeof saveProductAction>>;
    try {
      result = await saveProductAction(product?.id ?? null, formData);
    } catch {
      setPending(false);
      toast.error("Produk belum dapat disimpan. Periksa koneksi lalu coba kembali.");
      return;
    }

    if (!result.ok) {
      setPending(false);
      if (result.error.fieldErrors) {
        for (const [key, messages] of Object.entries(result.error.fieldErrors)) {
          if (key === "images") form.setError("root.images", { message: messages[0] });
          else form.setError(key as FieldPath<ProductFormInput>, { message: messages[0] });
        }
      }
      toast.error(result.error.message);
      return;
    }

    toast.success(status === "active" ? "Produk berhasil diterbitkan." : "Produk berhasil disimpan sebagai draft.");
    if (result.data.warning) toast.warning(result.data.warning);
    setFiles([]);
    setDeletedImageIds([]);
    router.replace(product ? `/dashboard/products/${result.data.id}/edit` : "/dashboard/products");
    router.refresh();
  }

  const handleIntent = (intent: "draft" | "publish") => form.handleSubmit(
    (values) => submit(values, intent),
    (errors) => {
      const message = firstErrorMessage(errors);
      toast.error(message ? `Periksa formulir: ${message}` : "Periksa kembali data produk yang belum valid.");
    },
  )();

  return (
    <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
      <Section description="Nama dan penjelasan singkat yang membantu pembeli mengenali produk." title="Informasi Dasar">
        <div className="grid gap-5">
          <div>
            <Label htmlFor="name">Nama produk</Label>
            <Input id="name" placeholder="Contoh: Tas Harian Kanvas" {...form.register("name")} />
            <FieldError message={form.formState.errors.name?.message} />
          </div>
          {product ? (
            <div>
              <Label htmlFor="short_description">Deskripsi singkat</Label>
              <Textarea className="min-h-24" id="short_description" placeholder="Ringkasan manfaat utama produk." {...form.register("short_description")} />
              <FieldHelp>Maksimal 240 karakter dan akan dipakai pada kartu produk.</FieldHelp>
              <FieldError message={form.formState.errors.short_description?.message} />
            </div>
          ) : <input type="hidden" {...form.register("short_description")} />}
          <div>
            <Label htmlFor="description">Deskripsi lengkap</Label>
            <Textarea id="description" placeholder="Jelaskan bahan, ukuran, cara penggunaan, atau informasi penting lainnya." {...form.register("description")} />
            <FieldError message={form.formState.errors.description?.message} />
          </div>
          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" placeholder="Contoh: TAS-KNV-001" {...form.register("sku")} />
            <FieldHelp>Kode unik untuk memudahkan pencarian dan pencatatan stok.</FieldHelp>
            <FieldError message={form.formState.errors.sku?.message} />
          </div>
        </div>
      </Section>

      <Section description="Gunakan rupiah penuh tanpa titik atau koma." title="Harga">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="price">Harga Jual</Label>
            <div className="relative mt-0">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
              <Input className="pl-10" id="price" min="0" step="1" type="number" {...form.register("price")} />
            </div>
            <FieldError message={form.formState.errors.price?.message} />
          </div>
          <div>
            <Label htmlFor="compare_at_price">Harga Sebelum Diskon</Label>
            <div className="relative mt-0">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
              <Input className="pl-10" id="compare_at_price" min="0" placeholder="Opsional" step="1" type="number" {...form.register("compare_at_price")} />
            </div>
            <FieldHelp>Harus lebih tinggi dari Harga Jual agar tampil sebagai harga coret.</FieldHelp>
            <FieldError message={form.formState.errors.compare_at_price?.message} />
          </div>
        </div>
      </Section>

      <Section description="Stok fisik yang tersedia dan urutan produk di katalog." title="Stok">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="stock">Stok Tersedia</Label>
            <Input id="stock" min="0" step="1" type="number" {...form.register("stock")} />
            {product?.reserved_stock ? <FieldHelp>{product.reserved_stock} unit sedang direservasi pesanan.</FieldHelp> : null}
            <FieldError message={form.formState.errors.stock?.message} />
          </div>
          <div>
            <Label htmlFor="sort_order">Urutan tampil</Label>
            <Input id="sort_order" min="0" step="1" type="number" {...form.register("sort_order")} />
            <FieldHelp>Angka lebih kecil tampil lebih dulu.</FieldHelp>
            <FieldError message={form.formState.errors.sort_order?.message} />
          </div>
        </div>
      </Section>

      <Section description="File diunggah ke bucket product-images sebelum URL-nya disimpan ke database." title="Gambar">
        <ProductImageUploader
          deletedImageIds={deletedImageIds}
          error={form.formState.errors.root?.images?.message}
          existingImages={product?.product_images ?? []}
          files={files}
          onDeletedImageIdsChange={setDeletedImageIds}
          onFilesChange={setFiles}
        />
      </Section>

      <Section description="Kelompokkan produk agar lebih mudah ditemukan. Kategori bersifat opsional." title="Kategori">
        {categories.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {categories.map((category) => (
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm hover:bg-secondary/50" key={category.id}>
                <input className="size-4 accent-primary" type="checkbox" value={category.id} {...form.register("category_ids")} />
                <span>
                  <strong className="block">{category.name}</strong>
                  {!category.is_active ? <span className="text-xs text-muted-foreground">Kategori nonaktif</span> : null}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p className="rounded-lg bg-secondary p-4 text-sm text-muted-foreground">Belum ada kategori. Produk tetap dapat disimpan tanpa kategori.</p>
        )}
        <FieldError message={form.formState.errors.category_ids?.message} />
      </Section>

      <Section description="Tentukan ke mana pembeli diarahkan ketika menekan tombol Beli." title="Tombol Beli">
        <div className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="cta_type">Tujuan Tombol Beli</Label>
              <Select id="cta_type" {...form.register("cta_type")}>
                <option value="whatsapp">WhatsApp</option>
                <option value="custom_url">Tautan eksternal</option>
                <option className="text-muted-foreground/50" disabled={!product} value="midtrans">
                  Midtrans
                </option>
              </Select>
              <FieldError message={form.formState.errors.cta_type?.message} />
            </div>
            <div>
              <Label htmlFor="cta_label">Teks tombol</Label>
              <Input id="cta_label" {...form.register("cta_label")} />
              <FieldError message={form.formState.errors.cta_label?.message} />
            </div>
          </div>

          {watchedCtaType === "custom_url" ? (
            <div>
              <Label htmlFor="custom_url">URL tujuan</Label>
              <Input id="custom_url" placeholder="https://..." type="url" {...form.register("custom_url")} />
              <FieldHelp>Hanya URL aman dengan awalan https:// yang diterima.</FieldHelp>
              <FieldError message={form.formState.errors.custom_url?.message} />
            </div>
          ) : null}

          {watchedCtaType === "whatsapp" ? (
            <div className="grid gap-5">
              <div>
                <Label htmlFor="whatsapp_number">Nomor WhatsApp khusus produk</Label>
                <Input id="whatsapp_number" placeholder="Contoh: 081234567890" {...form.register("whatsapp_number")} />
                <FieldHelp>Opsional. Bila kosong, sistem memakai nomor WhatsApp toko.</FieldHelp>
                <FieldError message={form.formState.errors.whatsapp_number?.message} />
              </div>
              <div>
                <Label htmlFor="whatsapp_template">Template pesan</Label>
                <Textarea id="whatsapp_template" placeholder="Halo, saya tertarik dengan {product_name}." {...form.register("whatsapp_template")} />
                <FieldHelp>Placeholder yang didukung: {"{product_name}"}, {"{product_price}"}, {"{product_url}"}, dan {"{product_sku}"}.</FieldHelp>
                <FieldError message={form.formState.errors.whatsapp_template?.message} />
              </div>
            </div>
          ) : null}

          {watchedCtaType === "midtrans" ? (
            <p className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm leading-6 text-primary">
              Produk ini dapat dibeli melalui checkout Midtrans dan stoknya akan dikelola oleh sistem.
            </p>
          ) : null}

          <label className="flex items-center gap-3 text-sm">
            <input className="size-4 accent-primary" type="checkbox" {...form.register("open_in_new_tab")} />
            Buka tujuan tombol di tab baru
          </label>
        </div>
      </Section>

      <details className="group rounded-xl border bg-card">
        <summary className="cursor-pointer list-none p-6 font-semibold">Pengaturan Lanjutan</summary>
        <div className="grid gap-5 border-t p-6">
          <div>
            <Label htmlFor="slug">Slug URL</Label>
            <Input
              id="slug"
              onChange={(event) => {
                setSlugManual(true);
                form.setValue("slug", createSlug(event.target.value), { shouldValidate: true });
              }}
              value={String(watchedSlug ?? "")}
            />
            <FieldHelp>Dibuat otomatis dari nama dan dapat diubah sebelum produk terbit.</FieldHelp>
            <FieldError message={form.formState.errors.slug?.message} />
          </div>
          <label className="flex items-center gap-3 text-sm">
            <input className="size-4 accent-primary" type="checkbox" {...form.register("is_featured")} />
            Tandai sebagai produk unggulan
          </label>
          <div>
            <Label htmlFor="seo_title">Judul SEO</Label>
            <Input id="seo_title" maxLength={70} {...form.register("seo_title")} />
            <FieldError message={form.formState.errors.seo_title?.message} />
          </div>
          <div>
            <Label htmlFor="seo_description">Deskripsi SEO</Label>
            <Textarea id="seo_description" maxLength={160} {...form.register("seo_description")} />
            <FieldError message={form.formState.errors.seo_description?.message} />
          </div>
        </div>
      </details>

      <div className="sticky bottom-3 z-20 flex flex-col gap-2 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-end">
        <Button disabled={pending} onClick={() => handleIntent("draft")} type="button" variant="outline">
          {pending ? <Loader2 aria-hidden="true" className="animate-spin" /> : <Save aria-hidden="true" />} Simpan Draft
        </Button>
        <Button disabled={pending} onClick={() => setPreviewOpen(true)} type="button" variant="secondary">
          <Eye aria-hidden="true" /> Lihat Pratinjau
        </Button>
        <Button disabled={pending} onClick={() => handleIntent("publish")} type="button">
          {pending ? <Loader2 aria-hidden="true" className="animate-spin" /> : <Send aria-hidden="true" />} Terbitkan
        </Button>
      </div>

      <Dialog onOpenChange={setPreviewOpen} open={previewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pratinjau Produk</DialogTitle>
            <DialogDescription>Pratinjau ini hanya terlihat oleh admin dan belum menerbitkan perubahan.</DialogDescription>
          </DialogHeader>
          <ProductPreview imageUrl={previewUrl ?? existingPreview} product={watchedValues as Partial<ProductFormValues>} />
        </DialogContent>
      </Dialog>
    </form>
  );
}
