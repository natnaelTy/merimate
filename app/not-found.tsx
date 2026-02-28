import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPinX } from "lucide-react"

export default function NotFound() {
  return (
    <section className="relative mx-auto flex min-h-[70vh] max-w-5xl flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <div className="space-y-4">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
          <MapPinX className="h-7 w-7" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
          Error 404
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          This page took a wrong turn.
        </h1>
        <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
          The page you are looking for does not exist or has been moved. Head back
          home or explore what Merimate can do for you.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link href="/">
          <Button variant="outline" size="lg">Back to home</Button>
        </Link>
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-16 h-40 w-40 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-32 w-32 rounded-full bg-muted/60 blur-2xl" />
      </div>
    </section>
  )
}
