import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Lead intelligence",
    copy: "Track every client touchpoint, status change, and follow-up date in one place.",
  },
  {
    title: "AI follow-ups",
    copy: "Generate concise responses tailored to the opportunity and your voice.",
  },
  {
    title: "Pipeline clarity",
    copy: "Instant stats on wins, losses, and proposal momentum so you stay focused.",
  },
  {
    title: "Clean handoffs",
    copy: "Notes, next steps, and last contact dates stay organized across projects.",
  },
];

export default function Features() {
  return (
    <section id="features" className="space-y-8">
      <div className="flex flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Features
        </p>
        <h2 className="text-3xl font-semibold">
          Everything you need to follow up like a pro.
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title} className="h-full">
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {feature.copy}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
