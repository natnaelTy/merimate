import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const pricing = [
  {
    title: "Starter",
    price: "$0",
    cadence: "forever",
    description: "For solo freelancers building their first repeatable pipeline.",
    perks: ["Unlimited leads", "AI follow-up drafts", "Email + Google auth"],
  },
  {
    title: "Studio",
    price: "$24",
    cadence: "per month",
    description: "For small teams managing multiple clients and handoffs.",
    perks: ["Shared workspace", "Advanced lead analytics", "Priority support"],
    highlight: true,
  },
  {
    title: "Agency",
    price: "$59",
    cadence: "per month",
    description: "For high-volume teams who need deeper operational insight.",
    perks: ["Multi-brand pipelines", "Custom AI prompts", "SLA onboarding"],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="space-y-8">
      <div className="flex flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Pricing
        </p>
        <h2 className="text-3xl font-semibold">
          Simple plans that grow with your pipeline.
        </h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {pricing.map((plan) => (
          <Card
            key={plan.title}
            className={
              plan.highlight ? "border-emerald-200 bg-white shadow-lg" : undefined
            }
          >
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle>{plan.title}</CardTitle>
                {plan.highlight ? <Badge>Most popular</Badge> : null}
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-semibold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">
                  {plan.cadence}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {plan.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                {plan.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
              <Link href="/signup">
                <Button
                  variant={plan.highlight ? "primary" : "outline"}
                  className="w-full"
                >
                  Choose {plan.title}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
