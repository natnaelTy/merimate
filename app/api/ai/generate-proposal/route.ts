import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groqApiKey = process.env.GROQ_API_KEY || "";
const groq = new Groq({ apiKey: groqApiKey });

export async function POST(req: Request) {
  const {
    jobTitle,
    description,
    jobDescription,
    notes,
    platform,
    clientName,
  } = (await req.json()) as {
    jobTitle?: string;
    description?: string;
    jobDescription?: string;
    notes?: string;
    platform?: string;
    clientName?: string;
  };

  const resolvedDescription =
    jobDescription || description || notes || "";

  if (!groqApiKey) {
    return NextResponse.json(
      { error: "Missing GROQ_API_KEY" },
      { status: 500 }
    );
  }

  if (!jobTitle) {
    return NextResponse.json(
      { error: "jobTitle is required" },
      { status: 400 }
    );
  }

  const prompt = `Write a professional, winning freelance proposal for this job:
Job: ${jobTitle}
Description: ${resolvedDescription || "N/A"}
Platform: ${platform}
Client: ${clientName || "the client"}

Structure: Greeting, show interest & understanding, highlight relevant skills/experience, propose clear plan/price (keep realistic), call to action. Keep under 400 words. Make it personalized and confident.`;

  try {
    const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model,
      temperature: 0.7,
      max_tokens: 800,
    });

    const generated =
      completion.choices[0]?.message?.content || "Error generating proposal.";
    return NextResponse.json({ proposal: generated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI error";
    return NextResponse.json({ error: "AI error", detail: message }, { status: 500 });
  }
}
