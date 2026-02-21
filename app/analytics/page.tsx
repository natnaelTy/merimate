"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StatsCard from "@/components/dashboard/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import AnalyticsSkeleton from "./AnalyticsSkeleton";

type AnalyticsResponse = {
  totalLeads: number;
  winRate: string | number;
  winsByPlatform: { platform: string; count: number }[];
  avgFollowUps: string | number;
  avgTimeToWin: string | number;
};

const periods = [
  { label: "All time", value: "all" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
];

const toNumber = (value: string | number | undefined) => {
  if (value === undefined) return 0;
  const num = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(num) ? num : 0;
};

export default function AnalyticsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState(periods[0].value);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadAnalytics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/analytics?period=${period}`, {
          cache: "no-store",
        });

        if (response.status === 401) {
          router.push("/signin");
          return;
        }

        if (!response.ok) {
          const message = "Unable to load analytics.";
          setError(message);
          toast.error(message);
          return;
        }

        const payload = (await response.json()) as AnalyticsResponse;
        if (isMounted) {
          setData(payload);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to load analytics.";
        setError(message);
        toast.error(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, [period, router]);

  const analytics = data ?? {
    totalLeads: 0,
    winRate: 0,
    winsByPlatform: [],
    avgFollowUps: 0,
    avgTimeToWin: 0,
  };

  const winRate = toNumber(analytics.winRate);
  const avgFollowUps = toNumber(analytics.avgFollowUps);
  const avgTimeToWin = toNumber(analytics.avgTimeToWin);
  const winsByPlatform = [...analytics.winsByPlatform].sort(
    (a, b) => b.count - a.count
  );
  const totalWins = winsByPlatform.reduce((sum, item) => sum + item.count, 0);
  const topPlatform = winsByPlatform[0];

  const insights = useMemo(() => {
    const items: string[] = [];

    if (topPlatform) {
      const share =
        totalWins > 0
          ? Math.round((topPlatform.count / totalWins) * 100)
          : 0;
      items.push(
        `Most wins come from ${topPlatform.platform} (${topPlatform.count} wins, ${share}% of wins).`
      );
    }

    if (avgFollowUps > 0) {
      items.push(
        `Won leads averaged ${avgFollowUps} follow-ups. Keep a steady cadence to lift replies.`
      );
    }

    if (avgTimeToWin > 0) {
      items.push(
        `Typical time-to-win is ${avgTimeToWin} days. Plan your pipeline around this cycle.`
      );
    }

    if (winRate >= 35 && analytics.totalLeads >= 10) {
      items.push("Your win rate is strong. Double down on the patterns above.");
    }

    if (items.length === 0) {
      items.push("No strong patterns yet. Add more leads to surface trends.");
    }

    return items;
  }, [analytics.totalLeads, avgFollowUps, avgTimeToWin, topPlatform, totalWins, winRate]);

  const opportunities = useMemo(() => {
    const items: string[] = [];

    if (analytics.totalLeads >= 10 && winRate < 20) {
      items.push("Win rate is under 20%. Tighten qualification and refine proposals.");
    }

    if (avgFollowUps < 1 && analytics.totalLeads >= 5) {
      items.push("Few follow-ups logged. Add reminders to increase response rates.");
    }

    if (topPlatform && totalWins > 0 && topPlatform.count / totalWins >= 0.7) {
      items.push(
        `Heavy reliance on ${topPlatform.platform}. Diversify channels to reduce risk.`
      );
    }

    if (items.length === 0) {
      items.push("No major red flags yet. Keep momentum and track follow-ups.");
    }

    return items;
  }, [analytics.totalLeads, avgFollowUps, topPlatform, totalWins, winRate]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Basic performance insights to boost your win rate.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {periods.map((option) => (
            <Button
              key={option.value}
              variant={period === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {error ? (
        <Card className="rounded-lg border border-destructive/40 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Analytics unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : null}

      {isLoading ? (
        <AnalyticsSkeleton />
      ) : (
        <>
          <div className="grid auto-rows-min gap-4 md:grid-cols-4">
            <StatsCard
              title="Total leads"
              value={analytics.totalLeads}
              description="All opportunities in this period."
            />
            <StatsCard
              title="Win rate"
              value={`${winRate}%`}
              description="Won vs closed leads."
            />
            <StatsCard
              title="Avg follow-ups"
              value={avgFollowUps || 0}
              description="Follow-ups per win."
            />
            <StatsCard
              title="Time to win"
              value={`${avgTimeToWin || 0} days`}
              description="Avg days from lead to win."
            />
          </div>

          <Card className="rounded-lg bg-sidebar border-none">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg font-semibold">What&apos;s working</CardTitle>
              <p className="text-sm text-muted-foreground">
                Highlights from your recent wins and follow-up habits.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-border/60 bg-card/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Insights
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {insights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-border/60 bg-card/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Opportunities
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {opportunities.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-border/60 bg-card/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Wins by platform
                  </p>
                  <div className="mt-3 space-y-2 text-sm">
                    {winsByPlatform.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No win data yet.</p>
                    ) : (
                      winsByPlatform.map((item) => {
                        const share =
                          totalWins > 0
                            ? Math.round((item.count / totalWins) * 100)
                            : 0;
                        return (
                          <div
                            key={item.platform}
                            className="flex items-center justify-between rounded-md border border-border/60 bg-background/70 px-3 py-2"
                          >
                            <div>
                              <p className="font-medium">{item.platform}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.count} wins
                              </p>
                            </div>
                            <Badge>{share}%</Badge>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border/60 bg-card/70 p-4">
                  <p className="text-sm font-medium">Win-rate playbook</p>
                  <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <p>Prioritize your best-performing platform first when prospecting.</p>
                    <p>Send follow-ups consistently until the average win cadence.</p>
                    <p>Track the time-to-win and keep your pipeline filled.</p>
                  </div>
                </div>
                <div className="rounded-lg border border-border/60 bg-card/70 p-4">
                  <p className="text-sm font-medium">Next actions</p>
                  <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <p>
                      If win rate dips, tighten qualification and refine proposals.
                    </p>
                    <p>
                      Use reminders to maintain follow-up momentum on open leads.
                    </p>
                    <p>
                      Diversify sources if one platform dominates your wins.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "rounded-lg bg-sidebar border-none",
              isLoading && "opacity-70",
            )}
          >
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg font-semibold">Data coverage</CardTitle>
              <p className="text-sm text-muted-foreground">
                Keep logging reminders and outcomes for sharper insights.
              </p>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between rounded-md border border-border/60 bg-background/70 px-3 py-2">
                <span>Leads tracked</span>
                <span className="font-medium text-foreground">
                  {analytics.totalLeads}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border/60 bg-background/70 px-3 py-2">
                <span>Platforms with wins</span>
                <span className="font-medium text-foreground">
                  {winsByPlatform.length}
                </span>
              </div>
            </CardContent>
          </Card>
        </>
      )}

    </div>
  );
}
