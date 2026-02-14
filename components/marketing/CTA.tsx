import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CTA() {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-lg border-none bg-card/80 p-8 shadow-sm backdrop-blur md:p-10">
          <div className="flex flex-col gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Ready to launch
              </p>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Your next follow-up, already drafted.
              </h2>
              <p className="mt-3 text-muted-foreground">
                Spin up Merimate in minutes and keep your pipeline moving.
              </p>
            </div>
            <Link href="/signup">
              <Button size="lg">Start free today</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
