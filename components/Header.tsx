import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function MarketingHeader() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-6 py-4">
      <div className="w-60 flex-shrink-0">
        <Image
          src="/merimate.png"
          alt="Merimate logo"
          width={60}
          height={60}
          className="object-cover"
        />
      </div>
      <nav className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <a href="#features" className="hover:text-foreground">
          Features
        </a>
        <a href="#pricing" className="hover:text-foreground">
          Pricing
        </a>
        <a href="#workflow" className="hover:text-foreground">
          Workflow
        </a>
      </nav>
      <div className="flex flex-wrap gap-3">
        <Link href="/signin">
          <Button variant="outline" size="sm">
            Sign in
          </Button>
        </Link>
        <Link href="/signup">
          <Button size="sm">Start free</Button>
        </Link>
      </div>
    </div>
  );
}
