import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { BETA_USER_LIMIT } from "@/lib/beta";
import { sendWaitlistConfirmationEmail } from "@/lib/email";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/dashboard";
  const redirectTo = next.startsWith("/") ? next : "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/signin", url.origin));
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/signin", url.origin));
  }

  try {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user?.id) {
      return NextResponse.redirect(new URL("/signin", url.origin));
    }

    const { data: existingUser, error: existingError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (existingError) {
      console.error("Failed to check existing user after OAuth.", existingError);
    }

    if (!existingUser?.id) {
      let betaOpen = false;
      try {
        const admin = createAdminSupabase();
        const { count, error: countError } = await admin
          .from("users")
          .select("id", { count: "exact", head: true });

        betaOpen = !countError && (count ?? 0) < BETA_USER_LIMIT;

        if (!betaOpen) {
          const fullName =
            (user.user_metadata?.full_name as string | undefined) ??
            (user.user_metadata?.name as string | undefined) ??
            null;
          await admin
            .from("beta_waitlist")
            .upsert(
              { email: user.email ?? `${user.id}@no-email.local`, full_name: fullName },
              { onConflict: "email" }
            );

          try {
            const origin =
              request.headers.get("origin") || new URL(request.url).origin;
            if (user.email) {
              await sendWaitlistConfirmationEmail({
                to: user.email,
                fullName,
                origin,
              });
            }
          } catch (emailError) {
            console.error("Waitlist email failed after OAuth.", emailError);
          }

          await supabase.auth.signOut();
          return NextResponse.redirect(new URL("/waitlist", url.origin));
        }
      } catch (gateError) {
        console.error("OAuth beta gate failed.", gateError);
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL("/waitlist", url.origin));
      }

      const { error: upsertError } = await supabase
        .from("users")
        .upsert(
          { id: user.id, email: user.email ?? `${user.id}@no-email.local` },
          { onConflict: "id" }
        );
      if (upsertError) {
        console.error("Failed to upsert user profile after OAuth.", upsertError);
      }
    }
  } catch (err) {
    console.error("OAuth profile upsert failed.", err);
  }

  return NextResponse.redirect(new URL(redirectTo, url.origin));
}
