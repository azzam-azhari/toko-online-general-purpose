import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesLoading() {
  return <div className="space-y-4"><Skeleton className="h-24" /><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" /></div>;
}
