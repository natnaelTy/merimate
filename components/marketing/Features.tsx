"use client"

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Brain, BellRing, Kanban, FileText, BarChart3, Clock } from "lucide-react"

const features = [
  {
    icon: Kanban,
    title: "Track every lead in one place",
    description:
      "Organize clients with statuses, notes, and a simple pipeline so nothing slips through the cracks.",
  },
  {
    icon: BellRing,
    title: "Never forget to follow up",
    description:
      "Get smart reminders when a client goes quiet so you always reach out at the right time.",
  },
  {
    icon: Brain,
    title: "AI follow-ups in seconds",
    description:
      "Generate professional, friendly replies instantly. Edit, copy, and send with confidence.",
  },
  {
    icon: FileText,
    title: "Write proposals faster",
    description:
      "Turn any job description into a tailored proposal that sounds like you — not a robot.",
  },
  {
    icon: BarChart3,
    title: "See what’s working",
    description:
      "Track wins, losses, and response times to understand how to close more deals.",
  },
  {
    icon: Clock,
    title: "Save hours every week",
    description:
      "Spend less time managing spreadsheets and more time doing paid work.",
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6 scroll-mt-24">
      <div className="mx-auto max-w-6xl text-center">
        {/* Header */}
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Everything you need to close more clients
        </h2>

        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Merimate keeps your leads organized, reminds you when to follow up,
          and helps you write better replies — so you win more work with less stress.
        </p>

        {/* Grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon

            return (
              <Card
                key={i}
                className="rounded-2xl text-left hover:shadow-md transition"
              >
                <CardHeader>
                  <Icon className="h-6 w-6 mb-4 text-primary" />

                  <CardTitle className="text-lg">
                    {feature.title}
                  </CardTitle>

                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
