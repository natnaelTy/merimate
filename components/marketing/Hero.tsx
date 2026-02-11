"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HeroSection() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="mx-auto max-w-6xl text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center rounded-full border px-3 py-1 text-sm text-muted-foreground">
          Built for freelancers • Powered by AI
        </div>

        {/* Headline */}
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl leading-tight">
          Meet your{" "}
          <span className="text-primary">AI deal teammate</span>
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

          <Link href="#pricing">
            <Button size="lg" variant="outline">
              View Pricing
            </Button>
          </Link>
        </div>

        {/* Dashboard mock */}
        <div className="mt-16 relative">
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-background/80 shadow-2xl backdrop-blur p-6 text-left sm:p-8">

            <div className="relative flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Pipeline snapshot
                </p>
                <h3 className="text-xl font-semibold">This week</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-900 dark:bg-emerald-700/20 dark:text-emerald-500">
                  +4 new
                </span>
                <span className="rounded-full px-3 py-1 font-medium bg-amber-100 text-amber-900 dark:bg-amber-700/20 dark:text-amber-500">
                  2 follow-ups today
                </span>
              </div>
            </div>

            <div className="relative mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/60 bg-card/50 p-4 shadow-sm">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Total Leads</span>
                  <span className="rounded-full bg-muted px-2 py-0.5">+8%</span>
                </div>
                <p className="mt-2 text-2xl font-semibold">24</p>
                <div className="mt-3 h-2 rounded-full bg-muted">
                  <div className="h-2 w-3/4 rounded-full bg-primary" />
                </div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card/50 p-4 shadow-sm">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Won</span>
                  <span className="rounded-full bg-muted px-2 py-0.5">+3</span>
                </div>
                <p className="mt-2 text-2xl font-semibold">9</p>
                <div className="mt-3 h-2 rounded-full bg-muted">
                  <div className="h-2 w-1/2 rounded-full bg-emerald-500" />
                </div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card/50 p-4 shadow-sm">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Win Rate</span>
                  <span className="rounded-full bg-muted px-2 py-0.5">
                    +5%
                  </span>
                </div>
                <p className="mt-2 text-2xl font-semibold">37%</p>
                <div className="mt-3 h-2 rounded-full bg-muted">
                  <div className="h-2 w-2/5 rounded-full bg-amber-500" />
                </div>
              </div>
            </div>

            <div className="relative mt-6 rounded-2xl border border-border/60 bg-card/50 p-4 text-sm shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-medium">Follow-ups due today</p>
                <span className="text-xs text-muted-foreground">3 items</span>
              </div>
              <ul className="space-y-3">
                {[
                  {
                    name: "John",
                    project: "Landing page redesign",
                    channel: "Email",
                  },
                  {
                    name: "Sarah",
                    project: "Shopify store setup",
                    channel: "Upwork",
                  },
                  {
                    name: "AgencyX",
                    project: "Mobile app project",
                    channel: "LinkedIn",
                  },
                ].map((item) => (
                  <li
                    key={item.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.project}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                      {item.channel}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* subtle glow */}
          <div className="absolute -z-10 inset-0 blur-2xl opacity-12 bg-primary rounded-full" />
        </div>
      </div>
    </section>
  )
}
