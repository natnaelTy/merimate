import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  BarChart3,
  Bell,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react"
import Link from "next/link"
import StatsCard from "@/components/dashboard/StatsCard"
import RecentLeads, { type RecentLeadItem } from "@/components/dashboard/RecentLeads"

const previewLeads: RecentLeadItem[] = [
  {
    id: "preview-1",
    clientName: "Northwind Labs",
    jobTitle: "B2B landing page revamp",
    status: "proposal",
    lastContact: "2026-02-18",
    nextReminderAt: "2026-03-03",
  },
  {
    id: "preview-2",
    clientName: "Studio Aya",
    jobTitle: "Shopify store setup",
    status: "follow-up",
    lastContact: "2026-02-15",
    nextReminderAt: "2026-03-01",
  },
]

export default function HeroSection() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="mx-auto max-w-6xl text-center mt-10">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center rounded-sm bg-primary/10 px-5 py-1.5 text-sm text-primary border border-primary/20">
          Built for freelancers • Powered by AI
        </div>

        {/* Headline */}
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl leading-tight">
          Meet your{" "}
          <span className="text-primary">AI </span> deal teammate
        </h1>

        {/* Subtext */}
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Merimate tracks your leads, reminds you to follow up, and helps you write
          winning replies — so you close more clients without the stress.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg">
              Start Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          {/* <Link href="#pricing">
            <Button size="lg" variant="outline">
              View Pricing
            </Button>
          </Link> */}
        </div>

        {/* Dashboard preview (matches the real dashboard layout) */}
        <div className="mt-16 relative">
          <div className="relative overflow-hidden rounded-xl border border-border/60 shadow-2xl">
            <div className="grid max-h-none lg:max-h-[500px] lg:grid-cols-[240px_minmax(0,1fr)]">
              <aside className="hidden lg:flex flex-col bg-sidebar text-sidebar-foreground border-r border-border/60">
                <div className="flex items-center gap-3 border-b border-border/60 px-4 py-4">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-sm font-semibold">
                    M
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-none">Merimate</p>
                    <p className="text-xs text-muted-foreground">Workspace</p>
                  </div>
                </div>
                <nav className="flex-1 px-3 py-4 space-y-2 text-sm">
                  {[
                    { label: "Dashboard", active: true, icon: LayoutDashboard },
                    { label: "Analytics", active: false, icon: BarChart3 },
                    { label: "Leads", active: false, icon: Users },
                    { label: "Follow-ups", active: false, icon: Bell },
                    { label: "Settings", active: false, icon: Settings },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition ${
                        item.active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </nav>
                <div className="border-t border-border/60 px-3 py-4">
                  <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/60 px-3 py-2">
                    <div className="size-8 rounded-lg bg-muted flex items-center justify-center text-xs font-semibold">
                      J
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold leading-none">Jamie</p>
                      <p className="text-xs text-muted-foreground">Freelancer</p>
                    </div>
                  </div>
                </div>
              </aside>

              <div className="flex flex-1 flex-col bg-gray-50/90 dark:bg-black/80">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3 sm:py-0 sm:h-14">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                    <span className="hidden sm:inline">Dashboard</span>
                    <span className="hidden sm:inline">/</span>
                    <span className="font-medium text-foreground">Overview</span>
                  </div>
                  <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                    <Button size="sm" variant="outline" className="w-full sm:w-auto">
                      Export
                    </Button>
                    <Button size="sm" className="w-full sm:w-auto">
                      New lead
                    </Button>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-3 p-3 text-left sm:gap-4 sm:p-4">
                  <div className="grid auto-rows-min gap-3 grid-cols-2 lg:grid-cols-4 sm:gap-4">
                    <StatsCard
                      title="Total leads"
                      value={24}
                      description="All active and closed opportunities."
                    />
                    <StatsCard
                      title="Won"
                      description="Number of leads won"
                      value={9}
                    />
                    <StatsCard
                      title="Win rate"
                      value="37%"
                      description="Won / closed leads."
                    />
                    <StatsCard
                      title="Reminders"
                      value={3}
                      description="Due this week."
                    />
                  </div>

                  <RecentLeads
                    className="min-h-[240px] flex-1 sm:min-h-[320px] md:min-h-min"
                    leads={previewLeads}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* subtle glow */}
          <div className="absolute -z-10 inset-0 rounded-full bg-primary blur-2xl opacity-20 dark:opacity-10" />
        </div>
      </div>
    </section>
  )
}
