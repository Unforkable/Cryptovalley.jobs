import { Skeleton } from "@/components/ui/skeleton";

function JobCardSkeleton() {
  return (
    <div className="rounded-xl border p-4">
      <div className="flex gap-4">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-5 w-56" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Skeleton className="h-9 w-32" />
      <Skeleton className="mt-2 h-5 w-80" />

      <div className="mt-6 flex gap-3">
        <Skeleton className="h-9 w-[160px] rounded-md" />
        <Skeleton className="h-9 w-[160px] rounded-md" />
        <Skeleton className="h-9 w-[180px] rounded-md" />
      </div>

      <Skeleton className="mt-6 h-4 w-20" />

      <div className="mt-4 flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
