import { redirect } from "next/navigation";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentLeads from "@/components/dashboard/RecentLeads";
import { createServerSupabaseReadOnly } from "@/lib/supabase/server";
import type { LeadStatus } from "@/types/lead";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseReadOnly();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const { data: leads } = await supabase
    .from("leads")
    .select("id, client_name, job_title, status, last_contact, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const leadRows =
    leads?.map((lead) => ({
      id: lead.id as string,
      clientName: lead.client_name as string,
      jobTitle: lead.job_title as string,
      status: lead.status as LeadStatus,
      lastContact: lead.last_contact as string | null,
      createdAt: lead.created_at as string,
    })) ?? [];

  const total = leadRows.length;
  const won = leadRows.filter((lead) => lead.status === "won").length;
  const lost = leadRows.filter((lead) => lead.status === "lost").length;
  const winRate = won + lost > 0 ? Math.round((won / (won + lost)) * 100) : 0;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <StatsCard
          title="Total leads"
          value={total}
          description="All active and closed opportunities."
        />
        <StatsCard title="Won" value={won} description="Closed this cycle." />
        <StatsCard
          title="Win rate"
          value={`${winRate}%`}
          description="Based on closed leads."
        />
      </div>

      <RecentLeads
        className="min-h-[100vh] flex-1 md:min-h-min"
        leads={leadRows.slice(0, 5)}
      />
    </div>
  );
}
