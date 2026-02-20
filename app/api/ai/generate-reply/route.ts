import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createServerSupabase } from "@/lib/supabase/server";

type Payload = {
  message?: string;
  clientName?: string;
  jobTitle?: string;
};

const groqApiKey = process.env.GROQ_API_KEY || "";
const groq = new Groq({ apiKey: groqApiKey });

export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!groqApiKey) {
    return NextResponse.json(
      { error: "Missing GROQ_API_KEY" },
      { status: 500 }
    );
  }

  const { message, clientName, jobTitle } = (await req.json()) as Payload;

  if (!message?.trim()) {
    return NextResponse.json(
      { error: "message is required" },
      { status: 400 }
    );
  }

  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  try {
    const completion = await groq.chat.completions.create({
      model,
      temperature: 0.6,
      max_tokens: 240,
      messages: [
        {
          role: "system",
          content:
            "You are an expert freelancer assistant. Write concise, friendly follow-up messages. Keep it under max of 120 words don't use name nither client nor freelancer.",
        },
        {
          role: "user",
          content: `\nRole: ${
            jobTitle || "Untitled role"
          }\nClient message: ${message}\nWrite a warm, confident reply with a clear next step.`,
        },
      ],
    });

    const output = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ message: output.trim() });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "AI error";
    return NextResponse.json(
      { error: "AI request failed", detail },
      { status: 500 }
    );
  }
}
