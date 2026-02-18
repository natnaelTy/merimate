"use server";

import Groq from "groq-sdk";
import { differenceInCalendarDays } from "date-fns";
import { createAdminSupabase } from "@/lib/supabase/admin";

const groqApiKey = process.env.GROQ_API_KEY || "";
const groq = new Groq({ apiKey: groqApiKey });

type EnsureDraftInput = {
  reminderId: string;
  userId: string;
  reminderAt: string;
  clientName: string;
  jobTitle: string;
  lastMessage: string;
};

export async function ensureDraftForReminder({
  reminderId,
  userId,
  reminderAt,
  clientName,
  jobTitle,
  lastMessage,
}: EnsureDraftInput) {
  if (!groqApiKey) {
    throw new Error("Missing GROQ_API_KEY");
  }

  const supabase = createAdminSupabase();
  const { data: reminder, error: reminderError } = await supabase
    .from("reminders")
    .select("id, userId, reminderAt, message, sent")
    .eq("id", reminderId)
    .eq("userId", userId)
    .maybeSingle();

  if (reminderError) {
    throw new Error(reminderError.message);
  }

  if (!reminder || reminder.sent) return null;
  if (reminder.message) return reminder.message;

  const diff = differenceInCalendarDays(
    new Date(reminder.reminderAt),
    new Date()
  );
  if (diff > 0) return null;

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

  const message = completion.choices[0]?.message?.content?.trim() || "";
  if (!message) return null;

  const { error: updateError } = await supabase
    .from("reminders")
    .update({ message, updatedAt: new Date().toISOString() })
    .eq("id", reminderId)
    .eq("userId", userId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return message;
}
