import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

type LeadRow = {
  id: string;
  platform: string | null;
  createdAt: string;
  updatedAt: string;
};

type ReminderRow = {
  leadId: string;
};

export async function GET(req: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "all";
  const platform = searchParams.get("platform") || null;
  const days = period === "all" ? null : Number.parseInt(period, 10);
  const createdAfter =
    days && Number.isFinite(days)
      ? new Date(Date.now() - days * 86400000).toISOString()
      : null;

  try {
    let totalQuery = supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("userId", user.id);

    if (platform) {
      totalQuery = totalQuery.eq("platform", platform);
    }
    if (createdAfter) {
      totalQuery = totalQuery.gte("createdAt", createdAfter);
    }

    const { count: totalLeads, error: totalError } = await totalQuery;
    if (totalError) {
      return NextResponse.json(
        { error: "Failed to load leads" },
        { status: 500 },
      );
    }

    let closedQuery = supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("userId", user.id)
      .in("status", ["WON", "LOST"]);

    let winsQuery = supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("userId", user.id)
      .eq("status", "WON");

    if (platform) {
      closedQuery = closedQuery.eq("platform", platform);
      winsQuery = winsQuery.eq("platform", platform);
    }
    if (createdAfter) {
      closedQuery = closedQuery.gte("createdAt", createdAfter);
      winsQuery = winsQuery.gte("createdAt", createdAfter);
    }

    const [{ count: closedLeads, error: closedError }, { count: wins, error: winsError }] =
      await Promise.all([closedQuery, winsQuery]);

    if (closedError || winsError) {
      return NextResponse.json(
        { error: "Failed to compute win rate" },
        { status: 500 },
      );
    }

    const winRate =
      closedLeads && closedLeads > 0
        ? ((wins ?? 0) / closedLeads * 100).toFixed(1)
        : 0;

    let wonLeadsQuery = supabase
      .from("leads")
      .select("id, platform, createdAt, updatedAt")
      .eq("userId", user.id)
      .eq("status", "WON");

    if (platform) {
      wonLeadsQuery = wonLeadsQuery.eq("platform", platform);
    }
    if (createdAfter) {
      wonLeadsQuery = wonLeadsQuery.gte("createdAt", createdAfter);
    }

    const { data: wonLeads, error: wonError } = await wonLeadsQuery;
    if (wonError) {
      return NextResponse.json(
        { error: "Failed to load wins" },
        { status: 500 },
      );
    }

    const wonRows = (wonLeads as LeadRow[]) ?? [];
    const wonLeadIds = wonRows.map((lead) => lead.id);

    let reminderCounts = new Map<string, number>();
    if (wonLeadIds.length > 0) {
      const { data: reminders, error: reminderError } = await supabase
        .from("reminders")
        .select("leadId")
        .eq("userId", user.id)
        .in("leadId", wonLeadIds);

      if (reminderError) {
        return NextResponse.json(
          { error: "Failed to load reminders" },
          { status: 500 },
        );
      }

      for (const reminder of (reminders as ReminderRow[]) ?? []) {
        reminderCounts.set(
          reminder.leadId,
          (reminderCounts.get(reminder.leadId) ?? 0) + 1,
        );
      }
    }

    const totalFollowUps = wonRows.reduce((sum, lead) => {
      return sum + (reminderCounts.get(lead.id) ?? 0);
    }, 0);

    const avgFollowUps =
      wonRows.length > 0
        ? (totalFollowUps / wonRows.length).toFixed(1)
        : 0;

    const timeToWinData = wonRows.map((lead) =>
      (new Date(lead.updatedAt).getTime() -
        new Date(lead.createdAt).getTime()) /
      86400000,
    );

    const avgTimeToWin =
      timeToWinData.length > 0
        ? (
            timeToWinData.reduce((total, value) => total + value, 0) /
            timeToWinData.length
          ).toFixed(1)
        : 0;

    const winsByPlatformMap = new Map<string, number>();
    for (const lead of wonRows) {
      const key = lead.platform ?? "Unknown";
      winsByPlatformMap.set(key, (winsByPlatformMap.get(key) ?? 0) + 1);
    }

    const winsByPlatform = Array.from(winsByPlatformMap.entries()).map(
      ([platformName, count]) => ({ platform: platformName, count }),
    );

    return NextResponse.json({
      totalLeads: totalLeads ?? 0,
      winRate,
      winsByPlatform,
      avgFollowUps,
      avgTimeToWin,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}