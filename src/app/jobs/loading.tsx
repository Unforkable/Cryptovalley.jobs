import { Skeleton } from "@/components/ui/skeleton";

function JobRowSkeleton() {
  return (
    <div className="flex gap-4 border-b py-4">
      <Skeleton className="size-10 shrink-0 rounded-sm" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-64 max-w-full" />
        <Skeleton className="h-3.5 w-32" />
      </div>
      <Skeleton className="hidden h-4 w-24 md:block" />
      <Skeleton className="hidden h-4 w-20 md:block" />
      <Skeleton className="hidden h-4 w-16 md:block" />
    </div>
  );
}

export default function JobsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <Skeleton className="h-14 w-56" />
      <Skeleton className="mt-3 h-5 w-96 max-w-full" />
      <Skeleton className="mt-8 h-10 w-full max-w-xl" />
      <div className="mt-12 border-t">
        {Array.from({ length: 8 }).map((_, i) => (
          <JobRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
