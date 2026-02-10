import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CTA() {
  return (
    <section className="rounded-lg border border-border/60 bg-white/80 p-10 backdrop-blur">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Ready to launch
          </p>
          <h2 className="text-3xl font-semibold">
            Your next follow-up, already drafted.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Spin up Merimate in minutes and keep your pipeline moving.
          </p>
        </div>
        <Link href="/signup">
          <Button size="lg">Start free today</Button>
        </Link>
      </div>
    </section>
  );
}
