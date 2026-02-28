import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { BETA_USER_LIMIT } from "@/lib/beta";
import { sendWaitlistConfirmationEmail } from "@/lib/email";

type BetaSignupRequest = {
  email?: string;
  fullName?: string;
};

export async function POST(request: Request) {
  let payload: BetaSignupRequest | null = null;
  try {
    payload = (await request.json()) as BetaSignupRequest;
  } catch {
    payload = null;
  }

  const email = String(payload?.email || "").trim().toLowerCase();
  const fullName = String(payload?.fullName || "").trim();

  if (!email) {
    return NextResponse.json({ error: "Missing email." }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminSupabase();
  } catch (error) {
    return NextResponse.json(
      { error: "Beta gate unavailable." },
      { status: 503 }
    );
  }

  const { count, error: countError } = await admin
    .from("users")
    .select("id", { count: "exact", head: true });

  if (countError) {
    return NextResponse.json(
      { error: "Unable to check beta capacity." },
      { status: 500 }
    );
  }

  if ((count ?? 0) >= BETA_USER_LIMIT) {
    const { error: waitlistError } = await admin
      .from("beta_waitlist")
      .upsert(
        {
          email,
          full_name: fullName || null,
        },
        { onConflict: "email" }
      );

    if (waitlistError) {
      return NextResponse.json(
        { error: "Unable to add you to the waitlist." },
        { status: 500 }
      );
    }

    try {
      const origin =
        request.headers.get("origin") || new URL(request.url).origin;
      await sendWaitlistConfirmationEmail({
        to: email,
        fullName,
        origin,
      });
    } catch (error) {
      console.error("Waitlist email failed", error);
    }

    return NextResponse.json({ status: "waitlisted" });
  }

  return NextResponse.json({ status: "allowed" });
}
