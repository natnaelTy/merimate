import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";

async function ensureUserRow(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  user: User
) {
  const email = user.email ?? `${user.id}@no-email.local`;

  const attempts = [
    {
      table: "users",
      payload: { id: user.id, email },
    },
    {
      table: "User",
      payload: { id: user.id, email },
    },
  ] as const;

  for (const attempt of attempts) {
    const { error } = await supabase
      .from(attempt.table)
      .upsert(attempt.payload, { onConflict: "id" });

    if (!error) {
      return;
    }

    if (error.code === "42P01") {
      continue;
    }

    throw new Error(error.message);
  }
}

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  try {
    const body = await request.json();
    const { leadId, reminderDate, type = "follow-up", message } = body;

    if (!leadId || !reminderDate) {
      return NextResponse.json(
        { error: "Missing leadId or reminderDate" },
        { status: 400 },
      );
    }

    const reminder_at = new Date(reminderDate).toISOString();

    // Get the user from the Supabase session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 },
      );
    }

    await ensureUserRow(supabase, user);

    const { data: leadRow, error: leadError } = await supabase
      .from("leads")
      .select("id")
      .eq("id", leadId)
      .eq("userId", user.id)
      .single();

    if (leadError || !leadRow) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 },
      );
    }

    const { data, error } = await supabase
      .from("reminders")
      .insert({
        id: crypto.randomUUID(),
        leadId,
        userId: user.id,
        reminderAt: reminder_at,
        type,
        message: typeof message === "string" && message.trim() ? message.trim() : null,
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, reminder: data });
  } catch (err: any) {
    console.error("Reminder creation error:", err);
    return NextResponse.json(
      { error: "Failed to create reminder" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  const url = new URL(request.url);
  const leadId = url.searchParams.get("leadId");

  let query = supabase
    .from("reminders")
    .select("id, leadId, reminderAt, sent, type, message, createdAt, updatedAt")
    .eq("userId", user.id)
    .order("reminderAt", { ascending: true });

  if (leadId) {
    query = query.eq("leadId", leadId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: "Failed to load reminders", detail: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data ?? []);
}
