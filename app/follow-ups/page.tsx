import Link from "next/link";
import { redirect } from "next/navigation";
import { differenceInCalendarDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FollowUpDraft from "@/components/followups/FollowUpDraft";
import { ensureDraftForReminder } from "@/app/follow-ups/actions";
import { createServerSupabaseReadOnly } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { leadStatuses, type LeadStatus } from "@/types/lead";

type ReminderRecord = {
  id: string;
  leadId: string;
  reminderAt: string;
  message: string | null;
};

type LeadRecord = {
  id: string;
  clientName: string | null;
  jobTitle: string | null;
  platform: string | null;
  notes: string | null;
  status: string;
};

type FollowUpRow = {
  id: string;
  leadId: string;
  reminderAt: string;
  message: string | null;
  clientName: string;
  jobTitle: string;
  platform: string;
  status: LeadStatus;
};

const statusVariant: Record<LeadStatus, "default" | "success" | "warning" | "danger"> = {
  new: "default",
  proposal: "warning",
  waiting: "warning",
  "follow-up": "warning",
  won: "success",
  lost: "danger",
};

const normalizeStatus = (status: string | null | undefined): LeadStatus => {
  const normalized = (status ?? "new").toLowerCase().replace(/_/g, "-");
  return (leadStatuses as readonly string[]).includes(normalized)
    ? (normalized as LeadStatus)
    : "new";
};

const getDueMeta = (reminderAt: string) => {
  const diff = differenceInCalendarDays(new Date(reminderAt), new Date());
  if (diff < 0) return { label: "Overdue", variant: "danger" as const };
  if (diff === 0) return { label: "Today", variant: "warning" as const };
  return { label: "Upcoming", variant: "default" as const };
};

function FollowUpSection({
  title,
  emptyText,
  rows,
  showDrafts,
}: {
  title: string;
  emptyText: string;
  rows: FollowUpRow[];
  showDrafts: boolean;
}) {

  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {rows.length} follow-up{rows.length === 1 ? "" : "s"}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          rows.map((row) => {
            const dueMeta = getDueMeta(row.reminderAt);
            return (
              <div
                key={row.id}
                className="rounded-lg border border-border/60 bg-background/60 px-4 py-3 text-sm transition hover:bg-background/80"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Link href={`/leads/${row.leadId}`} className="block">
                    <p className="font-medium">{row.clientName}</p>
                    <p className="text-xs text-muted-foreground">{row.jobTitle}</p>
                    <p className="text-xs text-muted-foreground text-primary mt-2">
                      {row.platform || "—"}
                    </p>
                  </Link>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={dueMeta.variant}>{dueMeta.label}</Badge>
                    {row.message ? <Badge variant="success">Draft ready</Badge> : null}
                    <Badge variant={statusVariant[row.status]}>{row.status}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(row.reminderAt)}
                    </span>
                  </div>
                </div>
                {showDrafts && row.message ? (
                  <FollowUpDraft
                    message={row.message}
                    clientName={row.clientName}
                    jobTitle={row.jobTitle}
                  />
                ) : null}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

export default async function FollowUpsPage() {
  const supabase = await createServerSupabaseReadOnly();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const { data: reminderRows } = await supabase
    .from("reminders")
    .select("id, leadId, reminderAt, message")
    .eq("userId", user.id)
    .eq("sent", false)
    .order("reminderAt", { ascending: true });

  const reminders = (reminderRows as ReminderRecord[]) ?? [];
  const remindersByLead = new Map<string, ReminderRecord>();

  for (const reminder of reminders) {
    if (!remindersByLead.has(reminder.leadId)) {
      remindersByLead.set(reminder.leadId, reminder);
    }
  }

  const leadIds = Array.from(remindersByLead.keys());
  let leadRows: LeadRecord[] = [];

  if (leadIds.length > 0) {
    const { data: leads } = await supabase
      .from("leads")
      .select("id, clientName, jobTitle, platform, status, notes")
      .eq("userId", user.id)
      .in("id", leadIds);

    leadRows = (leads as LeadRecord[]) ?? [];
  }

  const leadsById = new Map(leadRows.map((lead) => [lead.id, lead]));

  const now = new Date();

  const followUps = (
    await Promise.all(
      Array.from(remindersByLead.values()).map(async (reminder) => {
        const lead = leadsById.get(reminder.leadId);
        if (!lead) return null;

        let message = reminder.message ?? null;
        const diff = differenceInCalendarDays(new Date(reminder.reminderAt), now);

        if (!message && diff <= 0) {
          try {
            message = await ensureDraftForReminder({
              reminderId: reminder.id,
              userId: user.id,
              reminderAt: reminder.reminderAt,
              clientName: lead.clientName ?? "Unknown client",
              jobTitle: lead.jobTitle ?? "Untitled role",
              lastMessage: lead.notes ?? "",
            });
          } catch {
            message = null;
          }
        }

        return {
          id: reminder.id,
          leadId: reminder.leadId,
          reminderAt: reminder.reminderAt,
          message,
          clientName: lead.clientName ?? "Unknown client",
          jobTitle: lead.jobTitle ?? "Untitled role",
          platform: lead.platform ?? "—",
          status: normalizeStatus(lead.status),
        } satisfies FollowUpRow;
      })
    )
  ).filter(Boolean) as FollowUpRow[];
  const overdue: FollowUpRow[] = [];
  const today: FollowUpRow[] = [];
  const upcoming: FollowUpRow[] = [];

  for (const row of followUps) {
    const diff = differenceInCalendarDays(new Date(row.reminderAt), now);
    if (diff < 0) {
      overdue.push(row);
    } else if (diff === 0) {
      today.push(row);
    } else {
      upcoming.push(row);
    }
  }

  return (
    <div className="p-6 sm:p-8 max-w-6xl w-full mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Follow-ups</h1>
        <p className="text-sm text-muted-foreground">
          Track every lead with a scheduled follow-up.
        </p>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        <FollowUpSection
          title="Upcoming follow-ups"
          emptyText="No upcoming follow-ups."
          rows={upcoming}
          showDrafts={false}
        />
        <FollowUpSection
          title="Overdue follow-ups"
          emptyText="No overdue follow-ups."
          rows={overdue}
          showDrafts
        />
        <FollowUpSection
          title="Today's follow-ups"
          emptyText="Nothing due today."
          rows={today}
          showDrafts
        />
      </div>
    </div>
  );
}
