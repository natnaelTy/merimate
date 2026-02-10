import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { LeadStatus } from "@/types/lead";
import { deleteLead } from "@/app/leads/actions";

export type LeadRow = {
  id: string;
  clientName: string;
  jobTitle: string;
  platform: string | null;
  status: LeadStatus;
  lastContact: string | null;
};

const statusVariant: Record<LeadStatus, "default" | "success" | "warning" | "danger"> = {
  new: "default",
  proposal: "warning",
  waiting: "warning",
  "follow-up": "warning",
  won: "success",
  lost: "danger",
};

export default function LeadTable({ leads }: { leads: LeadRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Platform</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last contact</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => (
          <TableRow key={lead.id}>
            <TableCell className="font-medium">
              <Link href={`/leads/${lead.id}`} className="hover:underline">
                {lead.clientName}
              </Link>
            </TableCell>
            <TableCell>{lead.jobTitle}</TableCell>
            <TableCell>{lead.platform || "—"}</TableCell>
            <TableCell>
              <Badge variant={statusVariant[lead.status]}>{lead.status}</Badge>
            </TableCell>
            <TableCell>{formatDate(lead.lastContact)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Link href={`/leads/${lead.id}`}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
                <form action={deleteLead}>
                  <input type="hidden" name="id" value={lead.id} />
                  <Button variant="ghost" size="sm" type="submit">
                    Delete
                  </Button>
                </form>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
