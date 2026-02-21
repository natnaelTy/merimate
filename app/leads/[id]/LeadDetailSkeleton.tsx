import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LeadDetailSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
        <Card className="bg-sidebar border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-7 w-64" />
                <div className="flex flex-wrap items-center gap-3">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 shadow-sm bg-sidebar border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-80" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-44" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-[320px] w-full" />
              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-9 w-24" />
              </div>
            </CardContent>
            <CardContent className="space-y-6 border-t border-border/60 pt-5">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-72" />
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-[140px] w-full" />
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-[180px] w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-[140px] w-full" />
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-[180px] w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-sm bg-sidebar border-none">
              <CardHeader>
                <Skeleton className="h-5 w-28" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>

            <Card className="shadow-sm bg-sidebar border-none">
              <CardHeader>
                <Skeleton className="h-5 w-20" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-[140px] w-full" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>

            <Card className="shadow-sm bg-sidebar border-none">
              <CardHeader>
                <Skeleton className="h-5 w-28" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
