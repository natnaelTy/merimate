import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = context;
  const { id } = await params;

  const reminderId = id?.trim();
  if (!reminderId) {
    return NextResponse.json({ error: "Invalid reminder id" }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  let body: { sent?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body.sent !== "boolean") {
    return NextResponse.json(
      { error: "sent must be a boolean" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("reminders")
    .update({ sent: body.sent, updatedAt: new Date().toISOString() })
    .eq("id", reminderId)
    .eq("userId", user.id)
    .select("id, leadId, reminderAt, sent, type, message, createdAt, updatedAt")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
