import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { format } from "date-fns";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { sendReminderEmail } from "@/lib/email";

type ReminderRow = {
  id: string;
  leadId: string;
  userId: string;
  reminderAt: Date;
  message: string | null;
  sent: boolean;
  emailSentAt: Date | null;
};

type LeadRow = {
  id: string;
  userId: string;
  clientName: string | null;
  jobTitle: string | null;
  notes: string | null;
};

type UserRow = {
  id: string;
  email: string | null;
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
  let prisma: PrismaClient | null = null;
  let pool: Pool | null = null;
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Missing environment variables", missingEnv: ["DATABASE_URL"] },
        { status: 500 }
      );
    }

    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
    const now = new Date();

    const reminders = await prisma.$queryRaw<ReminderRow[]>(Prisma.sql`
      SELECT
        "id",
        "leadId",
        "userId",
        "reminderAt",
        "message",
        "sent",
        "emailSentAt"
      FROM "reminders"
      WHERE "sent" = false
        AND "reminderAt" <= ${now}
        AND "emailSentAt" IS NULL
      ORDER BY "reminderAt" ASC
      LIMIT ${MAX_PER_RUN}
    `);
    if (reminders.length === 0) {
      return NextResponse.json({ processed: 0 });
    }

    const leadIds = reminders.map((reminder) => reminder.leadId);
    const userIds = Array.from(new Set(reminders.map((reminder) => reminder.userId)));
    const leadRows = leadIds.length
      ? await prisma.$queryRaw<LeadRow[]>(Prisma.sql`
          SELECT
            "id",
            "userId",
            "clientName",
            "jobTitle",
            "notes"
          FROM "leads"
          WHERE "id" IN (${Prisma.join(leadIds)})
        `)
      : [];

    const leadsById = new Map(leadRows.map((lead) => [lead.id, lead]));
    const userRows = userIds.length
      ? await prisma.$queryRaw<UserRow[]>(Prisma.sql`
          SELECT
            "id",
            "email"
          FROM "users"
          WHERE "id" IN (${Prisma.join(userIds)})
        `)
      : [];
    const usersById = new Map(userRows.map((user) => [user.id, user]));

    let processed = 0;
    const failures: Array<{ reminderId: string; error: string }> = [];
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

    for (const reminder of reminders) {
      const lead = leadsById.get(reminder.leadId);
      if (!lead) continue;

      const user = usersById.get(reminder.userId);
      if (!user?.email) {
        failures.push({
          reminderId: reminder.id,
          error: "Missing user email",
        });
        continue;
      }

      try {
        let draft = reminder.message;

        if (!draft) {
          try {
            const generatedDraft = await generateFollowUpDraft({
              clientName: lead.clientName || "Unknown client",
              jobTitle: lead.jobTitle || "Untitled role",
              lastMessage: lead.notes || "",
            });

            if (generatedDraft) {
              const prompt = [
                "AUTO_DRAFT_FOLLOWUP",
                `Reminder: ${reminder.id}`,
                `Lead: ${reminder.leadId}`,
                `Due: ${reminder.reminderAt.toISOString()}`,
                `Client: ${lead.clientName || "Unknown client"}`,
                `Role: ${lead.jobTitle || "Untitled role"}`,
                `Last message: ${lead.notes || "None"}`,
              ].join("\n");

              await prisma.message.create({
                data: {
                  leadId: reminder.leadId,
                  userId: lead.userId,
                  prompt,
                  response: generatedDraft,
                },
              });

              await prisma.$executeRaw(Prisma.sql`
                UPDATE "reminders"
                SET "message" = ${generatedDraft}, "updatedAt" = ${new Date()}
                WHERE "id" = ${reminder.id}
              `);

              draft = generatedDraft;
            }
          } catch {
            draft = null;
          }
        }

        const dueLabel = format(reminder.reminderAt, "PPP");
        const leadLabel = [lead.clientName, lead.jobTitle].filter(Boolean).join(" - ");
        const subject = leadLabel
          ? `Follow-up due: ${leadLabel}`
          : "Follow-up due";
        const lines = [
          "A follow-up is due.",
          lead.clientName ? `Client: ${lead.clientName}` : null,
          lead.jobTitle ? `Role: ${lead.jobTitle}` : null,
          `Due date: ${dueLabel}`,
          siteUrl ? `Open lead: ${siteUrl}/leads/${reminder.leadId}` : null,
          draft ? `Draft message:\n${draft}` : null,
        ]
          .filter(Boolean)
          .join("\n");

        await sendReminderEmail({
          to: user.email,
          subject,
          text: lines,
        });

        const sentAt = new Date();
        await prisma.$executeRaw(Prisma.sql`
          UPDATE "reminders"
          SET "emailSentAt" = ${sentAt}, "updatedAt" = ${sentAt}
          WHERE "id" = ${reminder.id}
        `);

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
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
    if (pool) {
      await pool.end();
    }
  }
}
