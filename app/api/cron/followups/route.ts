import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createAdminSupabase } from "@/lib/supabase/admin";

type ReminderRow = {
  id: string;
  leadId: string;
  userId: string;
  reminderAt: string;
  message: string | null;
};

type LeadRow = {
  id: string;
  clientName: string | null;
  jobTitle: string | null;
  notes: string | null;
};

const MAX_PER_RUN = 25;

const groqApiKey = process.env.GROQ_API_KEY || "";
const groq = new Groq({ apiKey: groqApiKey });

const requireCronAuth = (request: Request) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) return null;
  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const headerSecret = request.headers.get("x-cron-secret");
  if (bearer === secret || headerSecret === secret) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
};

const generateFollowUpDraft = async ({
  clientName,
  jobTitle,
  lastMessage,
}: {
  clientName: string;
  jobTitle: string;
  lastMessage: string;
}) => {
  if (!groqApiKey) {
    throw new Error("Missing GROQ_API_KEY");
  }

  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  const completion = await groq.chat.completions.create({
    model,
    temperature: 0.6,
    max_tokens: 220,
    messages: [
      {
        role: "system",
        content:
          "You are an expert freelancer assistant. Write concise, friendly follow-up messages. Keep it under 120 words.",
      },
      {
        role: "user",
        content: `Client: ${clientName}\nRole: ${jobTitle}\nLast message: ${
          lastMessage || "None"
        }\nWrite a follow-up message that is warm, confident, and offers a clear next step.`,
      },
    ],
  });

  const message = completion.choices[0]?.message?.content || "";

  return message.trim();
};

export async function GET(request: Request) {
  try {
    const authError = requireCronAuth(request);
    if (authError) return authError;

    const supabase = createAdminSupabase();
    const now = new Date().toISOString();

    const { data: reminderRows, error: reminderError } = await supabase
      .from("reminders")
      .select("id, leadId, userId, reminderAt, message")
      .eq("sent", false)
      .lte("reminderAt", now)
      .is("message", null)
      .order("reminderAt", { ascending: true })
      .limit(MAX_PER_RUN);

    if (reminderError) {
      return NextResponse.json(
        { error: "Failed to load reminders", detail: reminderError.message },
        { status: 500 }
      );
    }

    const reminders = (reminderRows as ReminderRow[]) ?? [];
    if (reminders.length === 0) {
      return NextResponse.json({ processed: 0 });
    }

    const leadIds = reminders.map((reminder) => reminder.leadId);
    const { data: leadRows, error: leadError } = await supabase
      .from("leads")
      .select("id, clientName, jobTitle, notes")
      .in("id", leadIds);

    if (leadError) {
      return NextResponse.json(
        { error: "Failed to load leads", detail: leadError.message },
        { status: 500 }
      );
    }

    const leadsById = new Map(
      ((leadRows as LeadRow[]) ?? []).map((lead) => [lead.id, lead])
    );

    let processed = 0;
    const failures: Array<{ reminderId: string; error: string }> = [];

    for (const reminder of reminders) {
      const lead = leadsById.get(reminder.leadId);
      if (!lead) continue;

      try {
        const draft = await generateFollowUpDraft({
          clientName: lead.clientName || "Unknown client",
          jobTitle: lead.jobTitle || "Untitled role",
          lastMessage: lead.notes || "",
        });

        if (!draft) {
          throw new Error("Empty draft");
        }

        const prompt = [
          "AUTO_DRAFT_FOLLOWUP",
          `Reminder: ${reminder.id}`,
          `Lead: ${reminder.leadId}`,
          `Due: ${reminder.reminderAt}`,
          `Client: ${lead.clientName || "Unknown client"}`,
          `Role: ${lead.jobTitle || "Untitled role"}`,
          `Last message: ${lead.notes || "None"}`,
        ].join("\n");

        const { error: messageError } = await supabase.from("messages").insert({
          id: crypto.randomUUID(),
          leadId: reminder.leadId,
          userId: reminder.userId,
          prompt,
          response: draft,
        });

        if (messageError) {
          throw new Error(messageError.message);
        }

        const { error: updateError } = await supabase
          .from("reminders")
          .update({ message: draft, updatedAt: new Date().toISOString() })
          .eq("id", reminder.id);

        if (updateError) {
          throw new Error(updateError.message);
        }

        processed += 1;
      } catch (error) {
        failures.push({
          reminderId: reminder.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({ processed, failures });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Follow-up cron failed",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
