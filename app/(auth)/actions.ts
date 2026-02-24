"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

async function getSupabase() {
  return createServerSupabase();
}

async function getSiteUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  const headerList = await headers();
  const origin = headerList.get("origin");
  if (origin) {
    return origin.replace(/\/$/, "");
  }

  const host =
    headerList.get("x-forwarded-host") || headerList.get("host") || "";
  const proto = headerList.get("x-forwarded-proto") || "http";
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

async function getCallbackUrl() {
  return `${await getSiteUrl()}/auth/callback`;
}

export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  if (!email) {
    redirect("/signin?error=Missing%20email");
  }

  const supabase = await getSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${await getCallbackUrl()}?next=/dashboard`,
    },
  });

  if (error) {
    redirect(`/signin?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/signin?sent=1&email=${encodeURIComponent(email)}`);
}

export async function signUpWithEmail(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  if (!email) {
    redirect("/signup?error=Missing%20email");
  }

  const supabase = await getSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${await getCallbackUrl()}?next=/dashboard`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/signup?sent=1&email=${encodeURIComponent(email)}`);
}

export async function signInWithGoogle() {
  const supabase = await getSupabase();
  const { data } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${await getCallbackUrl()}?next=/dashboard`,
    },
  });

  if (data.url) {
    redirect(data.url);
  }
}

export async function signUpWithGoogle() {
  return signInWithGoogle();
}
