import { createClient } from "@supabase/supabase-js";

const decodeJwtPayload = (token: string) => {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as { role?: string };
  } catch {
    return null;
  }
};

export const createAdminSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase service role configuration.");
  }

  const payload = decodeJwtPayload(serviceRoleKey);
  if (!payload?.role || payload.role !== "service_role") {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not a service role key. Check your environment variables."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
