import { redirect } from "next/navigation";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentLeads from "@/components/dashboard/RecentLeads";
import { createServerSupabaseReadOnly } from "@/lib/supabase/server";
import type { LeadStatus } from "@/types/lead";
import { addDays } from "date-fns";

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
    .select("id, clientName, jobTitle, status, lastContact, createdAt")
    .eq("userId", user.id)
    .order("createdAt", { ascending: false });

  const leadRows =
    leads?.map((lead) => ({
      id: lead.id as string,
      clientName: lead.clientName as string,
      jobTitle: lead.jobTitle as string,
      status: lead.status as LeadStatus,
      lastContact: lead.lastContact as string | null,
      createdAt: lead.createdAt as string,
    })) ?? [];

  const leadIds = leadRows.map((lead) => lead.id);
  const remindersByLead = new Map<string, string>();

  if (leadIds.length > 0) {
    const { data: reminderRows } = await supabase
      .from("reminders")
      .select("leadId, reminderAt")
      .eq("userId", user.id)
      .eq("sent", false)
      .in("leadId", leadIds)
      .order("reminderAt", { ascending: true });

    for (const reminder of reminderRows ?? []) {
      if (!remindersByLead.has(reminder.leadId as string)) {
        remindersByLead.set(reminder.leadId as string, reminder.reminderAt as string);
      }
    }
  }

  const leadRowsWithReminders = leadRows.map((lead) => ({
    ...lead,
    nextReminderAt: remindersByLead.get(lead.id) ?? null,
  }));

  const total = leadRows.length;
  const won = leadRows.filter((lead) => lead.status === "won").length;
  const lost = leadRows.filter((lead) => lead.status === "lost").length;
  const winRate = won + lost > 0 ? Math.round((won / (won + lost)) * 100) : 0;

  const now = new Date();
  const weekFromNow = addDays(now, 7);
  const { data: upcomingReminders } = await supabase
    .from("reminders")
    .select("id, reminderAt")
    .eq("userId", user.id)
    .eq("sent", false)
    .gte("reminderAt", now.toISOString())
    .lte("reminderAt", weekFromNow.toISOString());

  const upcomingCount = upcomingReminders?.length ?? 0;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
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
        <StatsCard
          title="Reminders"
          value={upcomingCount}
          description="Due this week."
        />
      </div>

      <RecentLeads
        className="min-h-[100vh] flex-1 md:min-h-min"
        leads={leadRowsWithReminders.slice(0, 5)}
      />
    </div>
  );
}
