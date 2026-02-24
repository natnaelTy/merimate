import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

type ReminderRow = {
  id: string;
  leadId: string;
  reminderAt: string;
  message: string | null;
};

type LeadRow = {
  id: string;
  clientName: string | null;
  jobTitle: string | null;
};

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
  const rawLimit = Number(url.searchParams.get("limit") ?? "8");
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(rawLimit, 1), 50)
    : 8;
  const now = new Date().toISOString();

  const { data: reminderRows, error: reminderError } = await supabase
    .from("reminders")
    .select("id, leadId, reminderAt, message")
    .eq("userId", user.id)
    .eq("sent", false)
    .lte("reminderAt", now)
    .order("reminderAt", { ascending: true })
    .limit(limit);

  if (reminderError) {
    return NextResponse.json(
      { error: "Failed to load reminders", detail: reminderError.message },
      { status: 500 }
    );
  }

  const reminders = (reminderRows as ReminderRow[]) ?? [];
  const leadIds = Array.from(new Set(reminders.map((reminder) => reminder.leadId)));
  const leadsById = new Map<string, LeadRow>();

  if (leadIds.length > 0) {
    const { data: leadRows, error: leadError } = await supabase
      .from("leads")
      .select("id, clientName, jobTitle")
      .eq("userId", user.id)
      .in("id", leadIds);

    if (leadError) {
      return NextResponse.json(
        { error: "Failed to load leads", detail: leadError.message },
        { status: 500 }
      );
    }

    for (const lead of (leadRows as LeadRow[]) ?? []) {
      leadsById.set(lead.id, lead);
    }
  }

  const items = reminders.map((reminder) => {
    const lead = leadsById.get(reminder.leadId);
    return {
      id: reminder.id,
      leadId: reminder.leadId,
      reminderAt: reminder.reminderAt,
      message: reminder.message,
      clientName: lead?.clientName ?? null,
      jobTitle: lead?.jobTitle ?? null,
    };
  });

  return NextResponse.json({ count: items.length, items });
}
