import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { label: "Active leads", value: "18", change: "+4 this week" },
  { label: "Follow-ups due", value: "5", change: "2 urgent" },
  { label: "Win rate", value: "42%", change: "+7% this month" },
];

export default function Hero() {
  return (
    <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
      <div className="space-y-6">
        <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
          Meet your <span className="text-emerald-600">AI</span> deal teammate.
        </h1>
        <p className="text-lg text-muted-foreground">
          Merimate tracks your leads, reminds you to follow up, and helps you
          write winning replies — so you close more clients without the stress.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/signup">
            <Button size="lg">Start free</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg">
              View dashboard
            </Button>
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <Badge>Trusted by 1,200+ freelancers</Badge>
          <span>Average follow-up time: 2.4 minutes</span>
        </div>
      </div>

      <div className="relative">
        <Card className="overflow-hidden">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl">Today’s focus</CardTitle>
            <p className="text-sm text-muted-foreground">
              Lead momentum and follow-up streaks.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-border/60 bg-white/80 px-4 py-3"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  {item.label}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-semibold">{item.value}</p>
                  <span className="text-xs text-muted-foreground">
                    {item.change}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="absolute -bottom-8 -left-8 hidden h-40 w-40 rounded-lg bg-emerald-200/60 blur-2xl lg:block" />
      </div>
    </section>
  );
}
