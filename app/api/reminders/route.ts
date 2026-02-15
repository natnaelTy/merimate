import { createServerSupabase } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const cookieStore = await cookies();
  try {
    const body = await request.json();
    const { leadId, reminderDate, type = "follow-up" } = body;

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

    const { data, error } = await supabase
      .from("reminders")
      .insert({
        id: leadId,
        user_id: user.id, // Now user is defined
        reminder_at,
        type,
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
