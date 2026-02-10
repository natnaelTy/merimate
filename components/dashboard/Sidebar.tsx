"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/actions";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Leads", href: "/leads" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col justify-between bg-sidebar px-6 py-10 text-sidebar-foreground lg:flex">
      <div className="space-y-10">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-sidebar-muted">
            Merimate
          </p>
          <h1 className="text-2xl font-semibold">Freelancer CRM</h1>
        </div>

        <nav className="space-y-3">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-white text-primary"
                    : "text-sidebar-foreground/80 hover:bg-white/10"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <form action={signOut}>
        <Button
          type="submit"
          variant="ghost"
          className="w-full justify-center rounded-lg border border-white/10 text-sidebar-foreground hover:bg-white/10"
        >
          Sign out
        </Button>
      </form>
    </aside>
  );
}
