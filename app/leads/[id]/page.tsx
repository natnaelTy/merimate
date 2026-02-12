import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FollowupGenerator from "@/components/leads/FollowupGenerator";
import { createServerSupabaseReadOnly } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { updateLead } from "@/app/leads/actions";
import type { LeadStatus } from "@/types/lead";

const statuses: LeadStatus[] = [
  "new",
  "proposal",
  "waiting",
  "follow-up",
  "won",
  "lost",
];

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createServerSupabaseReadOnly();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const { data: lead } = await supabase
    .from("leads")
    .select(
      "id, client_name, job_title, platform, status, last_contact, notes, created_at"
    )
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!lead) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Lead detail
        </p>
        <h1 className="text-3xl font-semibold">{lead.client_name}</h1>
        <p className="text-sm text-muted-foreground">{lead.job_title}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Edit lead</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateLead} className="space-y-4">
              <input type="hidden" name="id" value={lead.id} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client name</Label>
                  <Input
                    id="clientName"
                    name="clientName"
                    defaultValue={lead.client_name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job title</Label>
                  <Input
                    id="jobTitle"
                    name="jobTitle"
                    defaultValue={lead.job_title}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Input
                    id="platform"
                    name="platform"
                    defaultValue={lead.platform ?? ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={(lead.status as LeadStatus) ?? "new"}
                    className="h-10 w-full rounded-lg border border-border/70 bg-white/80 px-3 text-sm shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastContact">Last contact</Label>
                  <Input
                    id="lastContact"
                    name="lastContact"
                    type="date"
                    defaultValue={lead.last_contact ?? ""}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={lead.notes ?? ""}
                />
              </div>
              <Button type="submit">Save changes</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDate(lead.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last contact</span>
                <span>{formatDate(lead.last_contact)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="capitalize">{lead.status}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI follow-up</CardTitle>
            </CardHeader>
            <CardContent>
              <FollowupGenerator
                clientName={lead.client_name}
                jobTitle={lead.job_title}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
