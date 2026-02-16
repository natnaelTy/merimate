import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

export const createServerSupabase = async () => {
  const cookieStore = await cookies();
  const canSetCookies = "set" in cookieStore;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          if (!canSetCookies) return;
          (cookieStore as typeof cookieStore & { set: (args: { name: string; value: string } & CookieOptions) => void }).set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          if (!canSetCookies) return;
          (cookieStore as typeof cookieStore & { set: (args: { name: string; value: string } & CookieOptions) => void }).set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );
};

export const createServerSupabaseReadOnly = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(_name: string, _value: string, _options: CookieOptions) {
          // No-op: server components cannot modify cookies.
        },
        remove(_name: string, _options: CookieOptions) {
          // No-op: server components cannot modify cookies.
        },
      },
    }
  );
};
