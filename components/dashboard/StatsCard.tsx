import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatsCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description: string;
}) {
  return (
    <Card className="rounded-lg bg-background/70 border-none">
      <CardHeader className="gap-1">
        <CardDescription className="text-[11px] uppercase tracking-[0.2em]">
          {title}
        </CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardHeader>
    </Card>
  );
}
