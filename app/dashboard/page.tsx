import { redirect } from "next/navigation";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentLeads from "@/components/dashboard/RecentLeads";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServerSupabaseReadOnly } from "@/lib/supabase/server";
import { leadStatuses, type LeadStatus } from "@/types/lead";
import { addDays, differenceInCalendarDays } from "date-fns";

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
    .select("id, clientName, jobTitle, status, lastContact, createdAt, updatedAt, platform, proposal")
    .eq("userId", user.id)
    .order("createdAt", { ascending: false });

  const normalizeStatus = (status: string | null | undefined): LeadStatus => {
    const normalized = (status ?? "new").toLowerCase().replace(/_/g, "-");
    return (leadStatuses as readonly string[]).includes(normalized)
      ? (normalized as LeadStatus)
      : "new";
  };

  const leadRows =
    leads?.map((lead) => ({
      id: lead.id as string,
      clientName: lead.clientName as string,
      jobTitle: lead.jobTitle as string,
      status: normalizeStatus(lead.status as string),
      lastContact: lead.lastContact as string | null,
      createdAt: lead.createdAt as string,
      updatedAt: lead.updatedAt as string,
      platform: lead.platform as string | null,
      proposal: lead.proposal as string | null,
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
  const winRate = total > 0 ? Math.round((won / total) * 100) : 0;
  const getWinRate = (wins: number, count: number) =>
    count > 0 ? Math.round((wins / count) * 100) : 0;

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

  const getPlatformLabel = (value: string | null) => value?.trim() || "Unknown";
  const getJobTypeLabel = (title: string | null) => {
    if (!title?.trim()) return "Unknown";
    const normalized = title.toLowerCase();
    if (normalized.includes("design")) return "Design";
    if (
      normalized.includes("developer") ||
      normalized.includes("engineer") ||
      normalized.includes("frontend") ||
      normalized.includes("backend") ||
      normalized.includes("full stack") ||
      normalized.includes("fullstack")
    ) {
      return "Development";
    }
    if (normalized.includes("marketing") || normalized.includes("seo") || normalized.includes("growth")) {
      return "Marketing";
    }
    if (normalized.includes("writer") || normalized.includes("copy") || normalized.includes("content")) {
      return "Writing";
    }
    if (normalized.includes("video") || normalized.includes("editor")) {
      return "Video";
    }
    return "Other";
  };

  const platformStats = new Map<string, { total: number; won: number; lost: number }>();
  const jobTypeStats = new Map<string, { total: number; won: number; lost: number }>();

  for (const lead of leadRows) {
    const platform = getPlatformLabel(lead.platform);
    const jobType = getJobTypeLabel(lead.jobTitle);
    const status = lead.status;

    const platformRow = platformStats.get(platform) ?? { total: 0, won: 0, lost: 0 };
    platformRow.total += 1;
    if (status === "won") platformRow.won += 1;
    if (status === "lost") platformRow.lost += 1;
    platformStats.set(platform, platformRow);

    const jobRow = jobTypeStats.get(jobType) ?? { total: 0, won: 0, lost: 0 };
    jobRow.total += 1;
    if (status === "won") jobRow.won += 1;
    if (status === "lost") jobRow.lost += 1;
    jobTypeStats.set(jobType, jobRow);
  }

  const platformBreakdown = Array.from(platformStats.entries())
    .map(([label, stats]) => ({
      label,
      total: stats.total,
      won: stats.won,
      lost: stats.lost,
      winRate: getWinRate(stats.won, stats.total),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const jobTypeBreakdown = Array.from(jobTypeStats.entries())
    .map(([label, stats]) => ({
      label,
      total: stats.total,
      won: stats.won,
      lost: stats.lost,
      winRate: getWinRate(stats.won, stats.total),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const insights: string[] = [];
  const withProposal = leadRows.filter((lead) => lead.proposal?.trim());
  const withoutProposal = leadRows.filter((lead) => !lead.proposal?.trim());

  const withWins = withProposal.filter((lead) => lead.status === "won").length;
  const withoutWins = withoutProposal.filter((lead) => lead.status === "won").length;
  const withTotal = withProposal.length;
  const withoutTotal = withoutProposal.length;

  if (withTotal >= 3 && withoutTotal >= 3) {
    const withRate = getWinRate(withWins, withTotal);
    const withoutRate = getWinRate(withoutWins, withoutTotal);
    const delta = withRate - withoutRate;
    if (Math.abs(delta) >= 10) {
      insights.push(
        `Leads with proposals win ${withRate}% vs ${withoutRate}% without (${delta > 0 ? "+" : ""}${delta} pts).`
      );
    }
  }

  const topPlatform = platformBreakdown.find((row) => row.total >= 3);
  if (topPlatform) {
    insights.push(
      `Best platform: ${topPlatform.label} at ${topPlatform.winRate}% win rate.`
    );
  }

  const topJobType = jobTypeBreakdown.find((row) => row.total >= 3);
  if (topJobType) {
    insights.push(
      `Best job type: ${topJobType.label} at ${topJobType.winRate}% win rate.`
    );
  }

  if (insights.length === 0) {
    insights.push("No strong patterns yet. Add more leads to surface trends.");
  }

  const cautions: string[] = [];
  const staleDays = 14;
  const staleProposals = leadRows.filter((lead) => {
    if (lead.status !== "proposal") return false;
    const updatedAt = new Date(lead.updatedAt);
    if (Number.isNaN(updatedAt.getTime())) return false;
    return differenceInCalendarDays(new Date(), updatedAt) >= staleDays;
  });

  if (staleProposals.length > 0) {
    cautions.push(
      `Low-response proposals: ${staleProposals.length} proposal(s) idle ${staleDays}+ days.`
    );
  }

  const lowWinPlatforms = platformBreakdown.filter(
    (row) => row.total >= 5 && row.winRate <= 10
  );
  if (lowWinPlatforms.length > 0) {
    cautions.push(
      `Low win rate platforms: ${lowWinPlatforms
        .map((row) => `${row.label} (${row.winRate}%)`)
        .join(", ")}.`
    );
  }

  if (cautions.length === 0) {
    cautions.push("No major red flags yet.");
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
        <StatsCard
          title="Total leads"
          value={total}
          description="All active and closed opportunities."
        />
        <StatsCard title="Won" value={won} />
        <StatsCard
          title="Win rate"
          value={`${winRate}%`}
          description="Won / total leads."
        />
        <StatsCard
          title="Reminders"
          value={upcomingCount}
          description="Due this week."
        />
      </div>

      <Card className="rounded-lg bg-background/70 border-none">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg font-semibold">Analytics &amp; Win Rate</CardTitle>
          <p className="text-sm text-muted-foreground">
            Win rate is calculated as won leads divided by total leads.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border/60 bg-card/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Win Rate
              </p>
              <p className="mt-2 text-3xl font-semibold">{winRate}%</p>
              <p className="text-xs text-muted-foreground">
                {total > 0
                  ? `${won} won out of ${total} total leads`
                  : "No leads yet"}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-card/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                What&apos;s working
              </p>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                {insights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-border/60 bg-card/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Not working
              </p>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                {cautions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border/60 bg-card/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Breakdown by platform</p>
                <Badge>{platformBreakdown.length}</Badge>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                {platformBreakdown.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No platform data yet.</p>
                ) : (
                  platformBreakdown.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between rounded-md border border-border/60 bg-background/70 px-3 py-2"
                    >
                      <div>
                        <p className="font-medium">{row.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {row.won} won / {row.total} leads
                        </p>
                      </div>
                      <span className="text-sm font-semibold">{row.winRate}%</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-card/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Breakdown by job type</p>
                <Badge>{jobTypeBreakdown.length}</Badge>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                {jobTypeBreakdown.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No job type data yet.</p>
                ) : (
                  jobTypeBreakdown.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between rounded-md border border-border/60 bg-background/70 px-3 py-2"
                    >
                      <div>
                        <p className="font-medium">{row.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {row.won} won / {row.total} leads
                        </p>
                      </div>
                      <span className="text-sm font-semibold">{row.winRate}%</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <RecentLeads
        className="min-h-[100vh] flex-1 md:min-h-min"
        leads={leadRowsWithReminders.slice(0, 5)}
      />
    </div>
  );
}
