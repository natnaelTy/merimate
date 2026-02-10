import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const workflowBadges = [
  "Lead stages",
  "Auto reminders",
  "AI tone control",
  "Smart notes",
];

export default function Workflow() {
  return (
    <section
      id="workflow"
      className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
    >
      <div className="rounded-lg border border-border/60 bg-white/80 p-10 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Workflow
        </p>
        <h3 className="mt-3 text-3xl font-semibold">
          One workspace for every lead and conversation.
        </h3>
        <p className="mt-4 text-sm text-muted-foreground">
          Capture a lead in seconds, log your last message, and let Merimate
          craft a follow-up you can send immediately. Every status change is
          tracked, so you always know what to do next.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {workflowBadges.map((item) => (
            <Badge key={item}>{item}</Badge>
          ))}
        </div>
      </div>
      <Card className="relative overflow-hidden">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-lg bg-emerald-200/70 blur-3xl" />
        <CardHeader>
          <CardTitle>Follow-up assistant</CardTitle>
          <p className="text-sm text-muted-foreground">
            “Hey Dana — circling back on the product landing page proposal.
            Happy to send over a short timeline or a quick Loom if helpful.”
          </p>
        </CardHeader>
        <CardContent>
          <Button size="sm">Generate another draft</Button>
        </CardContent>
      </Card>
    </section>
  );
}
