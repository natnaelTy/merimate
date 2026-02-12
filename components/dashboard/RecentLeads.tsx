import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
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
