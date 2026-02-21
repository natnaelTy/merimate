import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsSkeleton() {
  return (
    <>
      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={`stats-skeleton-${index}`} className="rounded-lg bg-sidebar border-none">
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-lg bg-sidebar border-none">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg font-semibold">What&apos;s working</CardTitle>
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`insight-skeleton-${index}`}
                className="rounded-lg border border-border/60 bg-card/70 p-4"
              >
                <Skeleton className="h-3 w-24" />
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={`playbook-skeleton-${index}`}
                className="rounded-lg border border-border/60 bg-card/70 p-4"
              >
                <Skeleton className="h-4 w-32" />
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg bg-sidebar border-none opacity-70">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg font-semibold">Data coverage</CardTitle>
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground">
          <div className="flex items-center justify-between rounded-md border border-border/60 bg-background/70 px-3 py-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex items-center justify-between rounded-md border border-border/60 bg-background/70 px-3 py-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-10" />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
