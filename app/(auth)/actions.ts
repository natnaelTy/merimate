"use server";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const callbackUrl = `${siteUrl}/auth/callback`;

async function getSupabase() {
  return createServerSupabase();
}

export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  if (!email) return;

  const supabase = await getSupabase();
  await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${callbackUrl}?next=/dashboard`,
    },
  });
}

export async function signUpWithEmail(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  if (!email) return;

  const supabase = await getSupabase();
  await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${callbackUrl}?next=/dashboard`,
      shouldCreateUser: true,
    },
  });
}

export async function signInWithGoogle() {
  const supabase = await getSupabase();
  const { data } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${callbackUrl}?next=/dashboard`,
    },
  });

  if (data.url) {
    redirect(data.url);
  }
}

export async function signUpWithGoogle() {
  return signInWithGoogle();
}
