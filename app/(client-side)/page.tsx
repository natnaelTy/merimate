import MarketingHeader from "@/components/Header";
import MarketingFooter from "@/components/Footer";
import Hero from "@/components/marketing/Hero";
import Features from "@/components/marketing/Features";
import Workflow from "@/components/marketing/Workflow";
import Pricing from "@/components/marketing/Pricing";
import CTA from "@/components/marketing/CTA";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(5,150,105,0.06),_transparent_50%),linear-gradient(180deg,_#f9fafb_0%,_#ffffff_55%,_#f3f4f6_100%)] px-6 pb-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-20">
        <header className="space-y-16">
          <MarketingHeader />
          <Hero />
        </header>
        <Features />
        <Workflow />
        <Pricing />
        <CTA />
        <MarketingFooter />
      </div>
    </div>
  );
}
