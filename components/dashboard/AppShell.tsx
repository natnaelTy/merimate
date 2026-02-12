"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isApp =
    pathname.startsWith("/dashboard") || pathname.startsWith("/leads");

  if (!isApp) {
    return <>{children}</>;
  }

  const isLeads = pathname.startsWith("/leads");
  const rootLabel = isLeads ? "Leads" : "Dashboard";
  const rootHref = isLeads ? "/leads" : "/dashboard";
  const hasDetail = isLeads && pathname.split("/").filter(Boolean).length > 1;
  const pageLabel = isLeads ? (hasDetail ? "Lead details" : "All leads") : "Overview";

  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset className="bg-black/90">
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 ">
          <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink asChild>
                  <Link href={rootHref}>{rootLabel}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{pageLabel}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
