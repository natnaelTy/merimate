import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createServerSupabase } from "@/lib/supabase/server";

const groqApiKey = process.env.GROQ_API_KEY || "";
const groq = new Groq({ apiKey: groqApiKey });

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clientName, jobTitle, lastMessage } = (await request.json()) as {
    clientName?: string;
    jobTitle?: string;
    lastMessage?: string;
  };

  if (!clientName || !jobTitle) {
    return NextResponse.json(
      { error: "clientName and jobTitle are required" },
      { status: 400 }
    );
  }

  if (!groqApiKey) {
    return NextResponse.json(
      { error: "Missing GROQ_API_KEY" },
      { status: 500 }
    );
  }

  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  try {
    const completion = await groq.chat.completions.create({
      model,
      temperature: 0.6,
      max_tokens: 220,
      messages: [
        {
          role: "system",
          content:
            "You are an expert freelancer assistant. Write concise, friendly follow-up messages. Keep it under 100 words.",
        },
        {
          role: "user",
          content: `Client: ${clientName}\nRole: ${jobTitle}\nLast message: ${lastMessage || "None"}\nWrite a follow-up message that is warm, confident, and offers a clear next step.`,
        },
      ],
    });

    const message = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ message: message.trim() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI error";
    return NextResponse.json(
      { error: "AI request failed", detail: message },
      { status: 500 }
    );
  }
}
