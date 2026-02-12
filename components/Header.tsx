"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClientSupabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, LogOut, Settings } from "lucide-react";


const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function NavBar() {
  const [showNavBar, setShowNavBar] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClientSupabase();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  }

  useEffect(() => {
    let isMounted = true;
    const supabase = createClientSupabase();

    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();
      if (!isMounted) return;
      if (!error) {
        setUser(data.user ?? null);
      }
      setAuthChecked(true);
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
      setAuthChecked(true);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 transition-opacity duration-300 bg-background/80 backdrop-blur border-b border-border/60 p-1">
      <div className="max-w-6xl w-full flex items-center justify-between mx-auto">
        <Link href="/">
          <Image
            src="/merimate.png"
            alt="Merimate logo"
            width={60}
            height={60}
            className="object-cover"
          />
        </Link>

        <div className="hidden md:flex flex-1 items-center justify-center gap-6 text-sm font-medium text-muted-foreground">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {authChecked && user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {(() => {
                    const avatarUrl =
                      (user.user_metadata?.avatar_url as string | undefined) ??
                      (user.user_metadata?.picture as string | undefined) ??
                      null;
                    const fallbackInitial =
                      user.email?.charAt(0).toUpperCase() ?? "U";

                    if (avatarUrl) {
                      return (
                        <Image
                          src={avatarUrl}
                          alt="Profile"
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      );
                    }

                    return (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                        {fallbackInitial}
                      </span>
                    );
                  })()}

                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>Account</span>
                      <span className="text-xs text-muted-foreground">
                        {user.email ?? "Unknown"}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex gap-2 items-center text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/signin">
                <Button variant="outline" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Start free</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
