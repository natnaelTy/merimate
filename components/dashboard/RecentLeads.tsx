import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { differenceInCalendarDays, format } from "date-fns";
import { Briefcase } from "lucide-react";
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
    <Card className={cn("rounded-lg bg-sidebar border-none", className)}>
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
              className="flex flex-col gap-3 rounded-lg border border-border/60 bg-card/70 px-4 py-3 text-sm transition hover:bg-card/80 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium">{lead.clientName}</p>
                  <p className="text-xs text-muted-foreground">{lead.jobTitle}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs sm:justify-end sm:text-sm">
                {(() => {
                  const meta = getReminderMeta(lead.nextReminderAt);
                  return meta ? (
                    <>
                      <span className="text-muted-foreground">
                        {meta.dateLabel}
                      </span>
                      <Badge variant={meta.variant}>{meta.badgeLabel}</Badge>
                    </>
                  ) : null;
                })()}
                <Badge variant={statusVariant[lead.status]}>{lead.status}</Badge>
                <span className="text-muted-foreground">
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
