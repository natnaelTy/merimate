import { redirect } from "next/navigation";
import LeadCreateDialog from "@/components/leads/LeadCreateDialog";
import LeadTable from "@/components/leads/LeadTable";
import { createServerSupabase } from "@/lib/supabase/server";
import type { LeadStatus } from "@/types/lead";

export default async function LeadsPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const { data: leads } = await supabase
    .from("leads")
    .select("id, client_name, job_title, platform, status, last_contact")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const leadRows =
    leads?.map((lead) => ({
      id: lead.id as string,
      clientName: lead.client_name as string,
      jobTitle: lead.job_title as string,
      platform: lead.platform as string | null,
      status: lead.status as LeadStatus,
      lastContact: lead.last_contact as string | null,
    })) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Leads
          </p>
          <h1 className="text-3xl font-semibold">Lead management</h1>
        </div>
        <LeadCreateDialog />
      </div>

      {leadRows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/60 bg-white/60 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No leads yet. Add your first lead to start tracking follow-ups.
          </p>
        </div>
      ) : (
        <LeadTable leads={leadRows} />
      )}
    </div>
  );
}
