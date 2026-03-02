import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { sendReminderEmail } from "@/lib/email";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const secret = process.env.CRON_SECRET;

  if (!secret || bearer !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: { email?: string } = {};
  try {
    payload = (await request.json()) as { email?: string };
  } catch {
    payload = {};
  }

  let email = String(payload.email || "").trim();

  if (!email) {
    try {
      const admin = createAdminSupabase();
      const { data: users } = await admin
        .from("users")
        .select("email")
        .order("createdAt", { ascending: false })
        .limit(1);
      email = users?.[0]?.email ?? "";
    } catch {
      email = "";
    }
  }

  if (!email) {
    return NextResponse.json(
      { error: "Missing email and no fallback user found." },
      { status: 400 }
    );
  }

  await sendReminderEmail({
    to: email,
    subject: "Merimate test reminder",
    text: "This is a test reminder email from Merimate.",
  });

  return NextResponse.json({ ok: true, sentTo: email });
}
