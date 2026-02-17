import { Skeleton } from "@/components/ui/skeleton";

function CompanyCardSkeleton() {
  return (
    <div className="rounded-xl border p-6">
      <div className="flex flex-col items-center text-center">
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="mt-3 h-5 w-28" />
        <Skeleton className="mt-2 h-4 w-24" />
        <Skeleton className="mt-2 h-4 w-full" />
      </div>
    </div>
  );
}

export default function CompaniesLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="mt-2 h-5 w-72" />

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CompanyCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
