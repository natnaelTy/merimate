import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { differenceInCalendarDays, format } from "date-fns";
import type { LeadStatus } from "@/types/lead";

const statusVariant: Record<LeadStatus, "default" | "success" | "warning" | "danger"> = {
  new: "default",
  proposal: "warning",
  waiting: "warning",
  "follow-up": "warning",
  won: "success",
  lost: "danger",
};

export type RecentLeadItem = {
  id: string;
  clientName: string;
  jobTitle: string;
  status: LeadStatus;
  lastContact: string | null;
  nextReminderAt?: string | null;
};

const getReminderMeta = (reminderAt?: string | null) => {
  if (!reminderAt) return null;
  const date = new Date(reminderAt);
  if (Number.isNaN(date.getTime())) return null;

  const diff = differenceInCalendarDays(date, new Date());
  if (diff < 0) {
    return {
      dateLabel: format(date, "MMM d"),
      badgeLabel: "Overdue",
      variant: "danger" as const,
    };
  }
  if (diff === 0) {
    return {
      dateLabel: format(date, "MMM d"),
      badgeLabel: "Due today",
      variant: "warning" as const,
    };
  }
  if (diff === 1) {
    return {
      dateLabel: format(date, "MMM d"),
      badgeLabel: "Due tomorrow",
      variant: "warning" as const,
    };
  }
  return {
    dateLabel: format(date, "MMM d"),
    badgeLabel: "Upcoming",
    variant: "default" as const,
  };
};

export default function RecentLeads({
  leads,
  className,
}: {
  leads: RecentLeadItem[];
  className?: string;
}) {
  return (
    <Card className={cn("rounded-lg bg-background/70 border-none", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent leads</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {leads.length === 0 ? (
          <p className="text-sm text-muted-foreground">No leads yet.</p>
        ) : (
          leads.map((lead) => (
            <Link
              key={lead.id}
              href={`/leads/${lead.id}`}
              className="flex items-center justify-between rounded-lg border border-border/60 bg-card/70 px-4 py-3 text-sm transition hover:bg-card/80"
            >
              <div>
                <p className="font-medium">{lead.clientName}</p>
                <p className="text-xs text-muted-foreground">{lead.jobTitle}</p>
              </div>
              <div className="flex items-center gap-3">
                {(() => {
                  const meta = getReminderMeta(lead.nextReminderAt);
                  return meta ? (
                    <>
                      <span className="text-xs text-muted-foreground">
                        {meta.dateLabel}
                      </span>
                      <Badge variant={meta.variant}>{meta.badgeLabel}</Badge>
                    </>
                  ) : null;
                })()}
                <Badge variant={statusVariant[lead.status]}>{lead.status}</Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(lead.lastContact)}
                </span>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
