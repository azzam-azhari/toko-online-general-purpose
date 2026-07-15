import "server-only";

import { createServiceClient } from "@/lib/supabase/service";
import { getSafeEntityStoragePaths } from "@/lib/supabase/storage-paths";

type CatalogImageBucket = "category-images" | "product-images";

type CleanupResult = {
  warning?: string;
};

export async function removeCatalogEntityFiles(
  bucket: CatalogImageBucket,
  entityId: string,
  knownPaths: readonly string[],
): Promise<CleanupResult> {
  try {
    const supabase = createServiceClient();
    const { data: listedFiles, error: listError } = await supabase.storage
      .from(bucket)
      .list(entityId, { limit: 1000 });

    const listedPaths = (listedFiles ?? [])
      .filter((file) => file.name !== ".emptyFolderPlaceholder")
      .map((file) => `${entityId}/${file.name}`);
    const safeKnownPaths = getSafeEntityStoragePaths(knownPaths, entityId);
    const paths = getSafeEntityStoragePaths([...safeKnownPaths, ...listedPaths], entityId);

    if (paths.length > 0) {
      let { error: removeError } = await supabase.storage.from(bucket).remove(paths);
      if (removeError) {
        ({ error: removeError } = await supabase.storage.from(bucket).remove(paths));
      }
      if (removeError) {
        return {
          warning: "Data sudah dihapus permanen, tetapi sebagian file gambar belum dapat dibersihkan dari Storage.",
        };
      }
    }

    if (listError) {
      return {
        warning: "Data sudah dihapus permanen, tetapi pemeriksaan akhir folder gambar di Storage belum berhasil.",
      };
    }

    if (safeKnownPaths.length !== new Set(knownPaths.map((path) => path.trim())).size) {
      return {
        warning: "Data sudah dihapus permanen, tetapi ada path gambar lama yang tidak aman sehingga tidak dihapus otomatis.",
      };
    }

    return {};
  } catch {
    return {
      warning: "Data sudah dihapus permanen, tetapi pembersihan file gambar di Storage belum dapat diverifikasi.",
    };
  }
}
