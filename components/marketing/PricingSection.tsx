"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "Up to 20 leads",
      "Statuses & notes",
      "Manual reminders",
      "10 AI follow-ups / month",
      "Simple dashboard",
    ],
    cta: "Start Free",
  },
  {
    name: "Pro",
    price: "$12",
    description: "For active freelancers",
    popular: true,
    features: [
      "Unlimited leads",
      "Unlimited AI follow-ups",
      "AI proposal writer",
      "Smart follow-up reminders",
      "Deal pipeline view",
      "Win-rate analytics",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
  },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="py-12 px-6 scroll-mt-24">
      <div className="mx-auto max-w-6xl text-center">
        {/* Header */}
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Simple pricing. Close one client and it pays for itself.
        </h2>

        <p className="mt-4 text-muted-foreground">
          Start free. Upgrade anytime. No contracts.
        </p>

        {/* Cards */}
        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className="relative flex flex-col justify-between rounded-lg shadow-sm transition hover:shadow-lg"
            >

              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>

                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col gap-6">
                <ul className="space-y-3 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-1 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full rounded-xl"
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust line */}
        <p className="mt-10 text-sm text-muted-foreground">
          One extra client can cover your entire year of Merimate.
        </p>
      </div>
    </section>
  )
}
