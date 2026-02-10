"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { cn } from "@/lib/utils";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isApp =
    pathname.startsWith("/dashboard") || pathname.startsWith("/leads");

  if (!isApp) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-6 py-10 lg:px-12">
        <div className="mb-8 flex items-center justify-between rounded-lg border border-border/60 bg-white/80 px-4 py-3 text-sm shadow-sm lg:hidden">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Merimate
            </p>
            <p className="font-semibold">Workspace</p>
          </div>
          <div className="flex gap-2">
            {[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Leads", href: "/leads" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-medium",
                  pathname.startsWith(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="mx-auto w-full max-w-6xl space-y-8">{children}</div>
      </main>
    </div>
  );
}
