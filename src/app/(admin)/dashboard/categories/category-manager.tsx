"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Baby,
  BookOpen,
  BriefcaseBusiness,
  Car,
  Dumbbell,
  FolderTree,
  Gamepad2,
  Gift,
  HeartPulse,
  Home,
  Loader2,
  Package,
  PawPrint,
  Pencil,
  Plus,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Trash2,
  Utensils,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { type FieldPath, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { deleteCategoryAction, saveCategoryAction } from "@/actions/categories.actions";
import { EmptyState } from "@/components/common/empty-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createSlug } from "@/lib/slug";
import type { Category } from "@/types/catalog";
import {
  categoryFormSchema,
  type CategoryFormInput,
  type CategoryFormValues,
} from "@/validations/category.schema";

const CATEGORY_ICON_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "shopping-bag", label: "Belanja" },
  { value: "shirt", label: "Fashion" },
  { value: "smartphone", label: "Elektronik" },
  { value: "home", label: "Rumah" },
  { value: "utensils", label: "Makanan" },
  { value: "heart-pulse", label: "Kesehatan" },
  { value: "sparkles", label: "Kecantikan" },
  { value: "baby", label: "Bayi" },
  { value: "dumbbell", label: "Olahraga" },
  { value: "book-open", label: "Buku" },
  { value: "gift", label: "Hadiah" },
  { value: "paw-print", label: "Hewan" },
  { value: "car", label: "Otomotif" },
  { value: "gamepad-2", label: "Game & Hobi" },
  { value: "briefcase-business", label: "Kantor" },
  { value: "package", label: "Umum" },
];

function CategoryIcon({ value, className }: { value?: string | null; className?: string }) {
  if (value === "shopping-bag") return <ShoppingBag aria-hidden="true" className={className} />;
  if (value === "shirt") return <Shirt aria-hidden="true" className={className} />;
  if (value === "smartphone") return <Smartphone aria-hidden="true" className={className} />;
  if (value === "home") return <Home aria-hidden="true" className={className} />;
  if (value === "utensils") return <Utensils aria-hidden="true" className={className} />;
  if (value === "heart-pulse") return <HeartPulse aria-hidden="true" className={className} />;
  if (value === "sparkles") return <Sparkles aria-hidden="true" className={className} />;
  if (value === "baby") return <Baby aria-hidden="true" className={className} />;
  if (value === "dumbbell") return <Dumbbell aria-hidden="true" className={className} />;
  if (value === "book-open") return <BookOpen aria-hidden="true" className={className} />;
  if (value === "gift") return <Gift aria-hidden="true" className={className} />;
  if (value === "paw-print") return <PawPrint aria-hidden="true" className={className} />;
  if (value === "car") return <Car aria-hidden="true" className={className} />;
  if (value === "gamepad-2") return <Gamepad2 aria-hidden="true" className={className} />;
  if (value === "briefcase-business") return <BriefcaseBusiness aria-hidden="true" className={className} />;
  if (value === "package") return <Package aria-hidden="true" className={className} />;
  return <FolderTree aria-hidden="true" className={className} />;
}

function CategoryFormDialog({ categories, category, open, onOpenChange }: {
  categories: Category[];
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [slugManual, setSlugManual] = useState(Boolean(category));
  const form = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      icon: CATEGORY_ICON_OPTIONS.some((option) => option.value === category?.icon) ? category?.icon ?? "package" : "package",
      parent_id: category?.parent_id ?? "",
      is_active: category?.is_active ?? true,
      sort_order: category?.sort_order ?? 0,
    },
  });
  const watchedName = useWatch({ control: form.control, name: "name" });
  const watchedSlug = useWatch({ control: form.control, name: "slug" });
  const watchedIcon = useWatch({ control: form.control, name: "icon" });

  useEffect(() => {
    if (!slugManual) form.setValue("slug", createSlug(String(watchedName ?? "")));
  }, [form, slugManual, watchedName]);

  async function submit(values: CategoryFormValues) {
    setPending(true);
    const result = await saveCategoryAction(category?.id ?? null, values);
    setPending(false);
    if (!result.ok) {
      if (result.error.fieldErrors) {
        for (const [key, messages] of Object.entries(result.error.fieldErrors)) {
          form.setError(key as FieldPath<CategoryFormInput>, { message: messages[0] });
        }
      }
      toast.error(result.error.message);
      return;
    }
    toast.success(category ? "Kategori berhasil diperbarui." : "Kategori berhasil ditambahkan.");
    onOpenChange(false);
    if (!category) router.replace("/dashboard/categories");
    router.refresh();
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
          <DialogDescription>Kategori membantu admin dan pembeli mengelompokkan produk.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" id="category-form" onSubmit={form.handleSubmit(submit)}>
          <div><Label htmlFor="category-name">Nama kategori</Label><Input id="category-name" placeholder="Contoh: Kebutuhan Harian" {...form.register("name")} />{form.formState.errors.name ? <p className="mt-1 text-sm text-destructive">{form.formState.errors.name.message}</p> : null}</div>
          {category ? (
            <div><Label htmlFor="category-slug">Slug</Label><Input id="category-slug" onChange={(event) => { setSlugManual(true); form.setValue("slug", createSlug(event.target.value), { shouldValidate: true }); }} value={String(watchedSlug ?? "")} />{form.formState.errors.slug ? <p className="mt-1 text-sm text-destructive">{form.formState.errors.slug.message}</p> : null}</div>
          ) : <input type="hidden" {...form.register("slug")} />}
          <div><Label htmlFor="category-description">Deskripsi</Label><Textarea className="min-h-24" id="category-description" {...form.register("description")} />{form.formState.errors.description ? <p className="mt-1 text-sm text-destructive">{form.formState.errors.description.message}</p> : null}</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="category-parent">Kategori induk</Label><Select id="category-parent" {...form.register("parent_id")}><option value="">Tanpa induk</option>{categories.filter((option) => option.id !== category?.id).map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</Select>{form.formState.errors.parent_id ? <p className="mt-1 text-sm text-destructive">{form.formState.errors.parent_id.message}</p> : null}</div>
            <div><Label htmlFor="category-order">Urutan tampil</Label><Input id="category-order" min="0" step="1" type="number" {...form.register("sort_order")} />{form.formState.errors.sort_order ? <p className="mt-1 text-sm text-destructive">{form.formState.errors.sort_order.message}</p> : null}</div>
          </div>
          <fieldset>
            <legend className="text-sm font-medium">Icon</legend>
            <p className="mt-1 text-xs text-muted-foreground" id="category-icon-help">Pilih ikon yang paling sesuai dengan isi kategori.</p>
            <input type="hidden" {...form.register("icon")} />
            <div aria-describedby="category-icon-help" aria-label="Pilihan icon kategori" className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-8" role="radiogroup">
              {CATEGORY_ICON_OPTIONS.map((option) => {
                const selected = watchedIcon === option.value;
                return (
                  <Button
                    aria-checked={selected}
                    className="h-auto min-h-16 flex-col gap-1 px-1.5 py-2 text-[11px]"
                    key={option.value}
                    onClick={() => form.setValue("icon", option.value, { shouldDirty: true, shouldValidate: true })}
                    role="radio"
                    tabIndex={selected ? 0 : -1}
                    title={option.label}
                    type="button"
                    variant={selected ? "secondary" : "outline"}
                  >
                    <CategoryIcon className="size-5" value={option.value} />
                    <span className="max-w-full truncate">{option.label}</span>
                  </Button>
                );
              })}
            </div>
            {form.formState.errors.icon ? <p className="mt-1 text-sm text-destructive">{form.formState.errors.icon.message}</p> : null}
          </fieldset>
          <label className="flex items-center gap-3 rounded-lg border p-3 text-sm"><input className="size-4 accent-primary" type="checkbox" {...form.register("is_active")} /><span><strong className="block">Kategori aktif</strong><span className="text-xs text-muted-foreground">Kategori aktif siap digunakan pada katalog publik.</span></span></label>
        </form>
        <DialogFooter>
          <Button disabled={pending} form="category-form" type="submit">{pending ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}{category ? "Simpan Perubahan" : "Tambah Kategori"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteCategoryButton({ category }: { category: Category }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function deleteCategory() {
    startTransition(async () => {
      const result = await deleteCategoryAction(category.id);
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      if (result.data.warning) toast.warning(result.data.warning);
      else toast.success("Kategori berhasil dihapus permanen.");
      router.refresh();
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button aria-label={`Hapus permanen ${category.name}`} disabled={pending} size="icon" variant="ghost">
          <Trash2 aria-hidden="true" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus kategori secara permanen?</AlertDialogTitle>
          <AlertDialogDescription>
            “{category.name}” akan dihapus permanen dan tidak dapat dikembalikan. Hubungan kategori pada
            produk akan dilepas, tetapi produknya tidak ikut dihapus. Subkategori akan menjadi kategori utama.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={deleteCategory}>
            Hapus Permanen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const parentNames = new Map(categories.map((category) => [category.id, category.name]));
  const openCreate = () => { setEditingCategory(null); setDialogOpen(true); };
  const openEdit = (category: Category) => { setEditingCategory(category); setDialogOpen(true); };

  return (
    <>
      <div className="flex justify-end"><Button onClick={openCreate} type="button"><Plus aria-hidden="true" /> Tambah Kategori</Button></div>
      {categories.length === 0 ? <EmptyState action={<Button onClick={openCreate} type="button"><Plus aria-hidden="true" /> Tambah Kategori</Button>} description="Buat kategori pertama untuk mengelompokkan produk." icon={FolderTree} title="Belum ada kategori" /> : (
        <div className="grid gap-3">
          {categories.map((category) => (
            <Card key={category.id}><CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><CategoryIcon className="size-5" value={category.icon} /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{category.name}</h2><Badge variant={category.is_active ? "secondary" : "outline"}>{category.is_active ? "Aktif" : "Nonaktif"}</Badge></div><p className="mt-1 text-xs text-muted-foreground">/{category.slug} · Urutan {category.sort_order}{category.parent_id ? ` · Induk: ${parentNames.get(category.parent_id) ?? "—"}` : ""}</p>{category.description ? <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{category.description}</p> : null}</div></div><div className="flex justify-end gap-1"><Button aria-label={`Edit ${category.name}`} onClick={() => openEdit(category)} size="icon" type="button" variant="ghost"><Pencil aria-hidden="true" /></Button><DeleteCategoryButton category={category} /></div></CardContent></Card>
          ))}
        </div>
      )}
      <CategoryFormDialog categories={categories} category={editingCategory} key={editingCategory?.id ?? "new"} onOpenChange={setDialogOpen} open={dialogOpen} />
    </>
  );
}
