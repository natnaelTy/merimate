import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY" },
      { status: 500 }
    );
  }

  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com";
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
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
          content: `Client: ${clientName}\nRole: ${jobTitle}\nLast message: ${lastMessage || "None"}\nWrite a follow-up message that is warm, confident, and offers a clear next step.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: "AI request failed", detail: errorText },
      { status: 500 }
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string }; text?: string }>;
  };

  const message =
    data.choices?.[0]?.message?.content || data.choices?.[0]?.text || "";

  return NextResponse.json({ message: message.trim() });
}
