import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";

type SignupPayload = {
  email?: string;
  password?: string;
  fullName?: string;
};

export async function POST(request: Request) {
  let payload: SignupPayload;
  try {
    payload = (await request.json()) as SignupPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const email = String(payload.email ?? "").trim().toLowerCase();
  const fullName = String(payload.fullName ?? "").trim();
  const password = String(payload.password ?? "");

  if (!email || !password || !fullName) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const admin = createAdminSupabase();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (error) {
      const message = error.message || "Failed to create user";
      const status = message.toLowerCase().includes("already") ? 409 : 400;
      return NextResponse.json({ error: message }, { status });
    }

    const userId = data.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "User creation failed" },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, userId, email });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Signup failed",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
