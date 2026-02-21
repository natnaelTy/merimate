import { Skeleton } from "@/components/ui/skeleton";

export default function LeadsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 10 }).map((_, index) => (
        <div
          key={`lead-skeleton-${index}`}
          className="p-5 border-none bg-sidebar rounded-lg"
        >
          <Skeleton className="h-4 w-36" />
          <Skeleton className="mt-3 h-4 w-20" />
          <Skeleton className="mt-4 h-3 w-16" />
        </div>
      ))}
    </div>
  );
}
