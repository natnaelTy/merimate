"use client"

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { UserPlus, Kanban, Sparkles, TrendingUp } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    title: "Add your leads",
    description:
      "Import or manually add clients from Upwork, email, LinkedIn, or anywhere you get work.",
  },
  {
    icon: Kanban,
    title: "Track conversations",
    description:
      "Organize each client with statuses, notes, and reminders so nothing gets forgotten.",
  },
  {
    icon: Sparkles,
    title: "Generate smart replies",
    description:
      "Use AI to instantly write follow-ups and proposals that sound professional and personal.",
  },
  {
    icon: TrendingUp,
    title: "Close more deals",
    description:
      "Respond faster, follow up consistently, and turn more prospects into paying clients.",
  },
]

export default function WorkflowSection() {
  return (
    <section
      id="workflow"
      className="py-24 px-6 bg-card dark:bg-card/10 scroll-mt-24"
    >
      <div className="mx-auto max-w-6xl text-center">
        {/* Header */}
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          How Merimate works
        </h2>

        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          A simple 4-step workflow to keep your freelance deals organized and
          moving forward.
        </p>

        {/* Steps */}
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => {
            const Icon = step.icon

            return (
              <Card
                key={i}
                className="rounded-2xl text-left transition hover:shadow-md"
              >
                <CardHeader>
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>

                  <CardTitle className="text-lg">
                    {i + 1}. {step.title}
                  </CardTitle>

                  <CardDescription className="text-sm leading-relaxed">
                    {step.description}
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
