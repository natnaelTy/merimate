import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createServerSupabase } from "@/lib/supabase/server";

type Task = "reply" | "grammar" | "professional";

type Payload = {
  task?: Task;
  text?: string;
  clientName?: string;
  jobTitle?: string;
};

const groqApiKey = process.env.GROQ_API_KEY || "";
const groq = new Groq({ apiKey: groqApiKey });

const getPrompt = ({ task, text, clientName, jobTitle }: Required<Payload>) => {
  const safeClient = clientName || "the client";
  const safeRole = jobTitle || "the role";

  if (task === "reply") {
    return `Write a concise, warm, professional reply to the client's message. Keep it under 120 words.
Client: ${safeClient}
Role: ${safeRole}
Client message: ${text}
Include a clear next step and keep the tone confident and friendly.`;
  }

  if (task === "grammar") {
    return `Correct grammar, spelling, and punctuation in the text below. Preserve the original tone and meaning. Return only the corrected text.
Text: ${text}`;
  }

  return `Rewrite the text below to be more professional, polished, and concise while preserving the meaning. Return only the rewritten text.
Text: ${text}`;
};

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

  const { task, text, clientName, jobTitle } = (await req.json()) as Payload;

  if (!task || !text?.trim()) {
    return NextResponse.json(
      { error: "task and text are required" },
      { status: 400 }
    );
  }

  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  try {
    const completion = await groq.chat.completions.create({
      model,
      temperature: 0.4,
      max_tokens: 320,
      messages: [
        {
          role: "system",
          content:
            "You are a professional freelance assistant. Be concise, clear, and helpful.",
        },
        {
          role: "user",
          content: getPrompt({
            task,
            text: text.trim(),
            clientName: clientName || "",
            jobTitle: jobTitle || "",
          }),
        },
      ],
    });

    const output = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ output: output.trim() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI error";
    return NextResponse.json(
      { error: "AI request failed", detail: message },
      { status: 500 }
    );
  }
}
