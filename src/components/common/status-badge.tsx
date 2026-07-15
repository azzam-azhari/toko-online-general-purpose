import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProductStatus } from "@/types/catalog";

const labels: Record<ProductStatus, string> = {
  draft: "Draft",
  active: "Terbit",
  inactive: "Nonaktif",
  archived: "Diarsipkan",
};

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return (
    <Badge
      className={cn(
        status === "active" && "border-emerald-200 bg-emerald-50 text-emerald-800",
        status === "draft" && "border-amber-200 bg-amber-50 text-amber-800",
        status === "inactive" && "border-slate-200 bg-slate-50 text-slate-700",
      )}
      variant={status === "archived" ? "outline" : "secondary"}
    >
      {labels[status]}
    </Badge>
  );
}
