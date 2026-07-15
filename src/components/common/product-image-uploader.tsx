"use client";

import { ImagePlus, Trash2, Undo2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useMemo } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types/catalog";

const MAX_FILES = 10;
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/avif", "image/jpeg", "image/png", "image/webp"]);

type ProductImageUploaderProps = {
  existingImages: ProductImage[];
  files: File[];
  deletedImageIds: string[];
  onFilesChange: (files: File[]) => void;
  onDeletedImageIdsChange: (ids: string[]) => void;
  error?: string;
};

export function ProductImageUploader({
  existingImages,
  files,
  deletedImageIds,
  onFilesChange,
  onDeletedImageIdsChange,
  error,
}: ProductImageUploaderProps) {
  const inputId = useId();
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  function addFiles(selected: File[]) {
    const invalidType = selected.find((file) => !ALLOWED_TYPES.has(file.type));
    if (invalidType) {
      toast.error("Gunakan gambar AVIF, JPEG, PNG, atau WebP.");
      return;
    }

    const oversized = selected.find((file) => file.size > MAX_SIZE);
    if (oversized) {
      toast.error("Ukuran setiap gambar maksimal 5 MB.");
      return;
    }

    const existingCount = existingImages.length - deletedImageIds.length;
    if (existingCount + files.length + selected.length > MAX_FILES) {
      toast.error(`Satu produk maksimal memiliki ${MAX_FILES} gambar.`);
      return;
    }

    onFilesChange([...files, ...selected]);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Label htmlFor={inputId}>Gambar produk</Label>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Maksimal 10 gambar, 5 MB per file. Format AVIF, JPEG, PNG, atau WebP.
          </p>
        </div>
        <Button asChild size="sm" type="button" variant="outline">
          <label className="cursor-pointer" htmlFor={inputId}>
            <ImagePlus aria-hidden="true" /> Pilih Gambar
          </label>
        </Button>
      </div>
      <Input
        accept="image/avif,image/jpeg,image/png,image/webp"
        className="sr-only"
        id={inputId}
        multiple
        onChange={(event) => {
          addFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
        type="file"
      />

      {existingImages.length === 0 && files.length === 0 ? (
        <label
          className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed bg-secondary/40 px-6 text-center transition-colors hover:bg-secondary/70"
          htmlFor={inputId}
        >
          <ImagePlus aria-hidden="true" className="mb-3 size-7 text-primary" />
          <span className="text-sm font-semibold">Tambahkan foto produk</span>
          <span className="mt-1 text-xs text-muted-foreground">Gambar pertama otomatis menjadi gambar utama.</span>
        </label>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {existingImages.map((image, index) => {
            const deleted = deletedImageIds.includes(image.id);
            return (
              <div className={cn("group relative aspect-square overflow-hidden rounded-xl border bg-muted", deleted && "opacity-40")} key={image.id}>
                <Image alt={image.alt_text ?? "Gambar produk"} className="object-cover" fill sizes="160px" src={image.url} />
                {index === 0 && !deleted ? (
                  <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground">Utama</span>
                ) : null}
                <Button
                  aria-label={deleted ? "Batalkan hapus gambar" : "Hapus gambar"}
                  className="absolute bottom-2 right-2 shadow-md"
                  onClick={() =>
                    onDeletedImageIdsChange(
                      deleted ? deletedImageIds.filter((id) => id !== image.id) : [...deletedImageIds, image.id],
                    )
                  }
                  size="icon"
                  type="button"
                  variant={deleted ? "secondary" : "destructive"}
                >
                  {deleted ? <Undo2 aria-hidden="true" /> : <Trash2 aria-hidden="true" />}
                </Button>
              </div>
            );
          })}
          {files.map((file, index) => (
            <div className="group relative aspect-square overflow-hidden rounded-xl border bg-muted" key={`${file.name}-${file.lastModified}-${index}`}>
              <Image alt={`Pratinjau ${file.name}`} className="object-cover" fill sizes="160px" src={previews[index]} unoptimized />
              <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-1 text-[10px] font-bold">Baru</span>
              <Button
                aria-label={`Hapus ${file.name}`}
                className="absolute bottom-2 right-2 shadow-md"
                onClick={() => onFilesChange(files.filter((_, fileIndex) => fileIndex !== index))}
                size="icon"
                type="button"
                variant="destructive"
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      )}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
