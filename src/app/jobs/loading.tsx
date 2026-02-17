import { Skeleton } from "@/components/ui/skeleton";

function JobCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex gap-4">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-5 w-56" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-3.5 w-12 shrink-0" />
      </div>
    </div>
  );
}

export default function JobsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="mt-2 h-5 w-96" />

      <div className="mt-8">
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>

      <div className="mt-8">
        <Skeleton className="h-4 w-24" />
        <div className="mt-4 flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
