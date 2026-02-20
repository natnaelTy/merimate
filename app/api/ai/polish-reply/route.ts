import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createServerSupabase } from "@/lib/supabase/server";

type Payload = {
  text?: string;
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

  const { text } = (await req.json()) as Payload;

  if (!text?.trim()) {
    return NextResponse.json(
      { error: "text is required" },
      { status: 400 }
    );
  }

  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  try {
    const completion = await groq.chat.completions.create({
      model,
      temperature: 0.3,
      max_tokens: 260,
      messages: [
        {
          role: "system",
          content:
            "You are a professional freelance assistant. Be concise, clear, and helpful.",
        },
        {
          role: "user",
          content: `Correct grammar, spelling, and punctuation while preserving tone and meaning. Return only the corrected text. be professional. \nText: ${text}`,
        },
      ],
    });

    const output = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ output: output.trim() });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "AI error";
    return NextResponse.json(
      { error: "AI request failed", detail },
      { status: 500 }
    );
  }
}
