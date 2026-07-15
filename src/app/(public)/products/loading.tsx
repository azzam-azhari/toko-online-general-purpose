import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"><Skeleton className="h-12 w-64" /><Skeleton className="mt-4 h-6 w-full max-w-xl" /><div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <Skeleton className="aspect-[3/4] rounded-2xl" key={index} />)}</div></main>;
}
