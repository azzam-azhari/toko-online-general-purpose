import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return <div className="space-y-5"><Skeleton className="h-24" /><Skeleton className="h-20" /><Skeleton className="h-96" /></div>;
}
