import Link from "next/link";
import Image from "next/image";
export default function MarketingFooter() {
  return (
    <footer className="border-t border-border/60 pt-10 text-sm text-muted-foreground">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Image src="/merimate.png" alt="Merimate logo" width={90} height={90} className="object-cover" />
          <p>Freelancer CRM + AI follow-up assistant.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/signin" className="hover:text-foreground">
            Sign in
          </Link>
          <a href="#features" className="hover:text-foreground">
            Features
          </a>
          <a href="#pricing" className="hover:text-foreground">
            Pricing
          </a>
        </div>
      </div>
    </footer>
  );
}
