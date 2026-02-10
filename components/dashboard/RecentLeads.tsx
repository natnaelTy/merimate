import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function RecentLeads({ leads }: { leads: RecentLeadItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent leads</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {leads.length === 0 ? (
          <p className="text-sm text-muted-foreground">No leads yet.</p>
        ) : (
          leads.map((lead) => (
            <Link
              key={lead.id}
              href={`/leads/${lead.id}`}
              className="flex items-center justify-between rounded-lg border border-border/60 bg-white/70 px-4 py-3 text-sm transition hover:bg-white"
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
