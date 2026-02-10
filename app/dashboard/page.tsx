import { redirect } from "next/navigation";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentLeads from "@/components/dashboard/RecentLeads";
import { createServerSupabase } from "@/lib/supabase/server";
import type { LeadStatus } from "@/types/lead";

export default async function DashboardPage() {
  const supabase = await createServerSupabase();
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
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Dashboard
        </p>
        <h1 className="text-3xl font-semibold">Your pipeline at a glance</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total leads"
          value={total}
          description="All active and closed opportunities."
        />
        <StatsCard title="Won" value={won} description="Closed this cycle." />
        <StatsCard title="Lost" value={lost} description="Missed this cycle." />
        <StatsCard
          title="Win rate"
          value={`${winRate}%`}
          description="Based on closed leads."
        />
      </div>

      <RecentLeads leads={leadRows.slice(0, 5)} />
    </div>
  );
}
