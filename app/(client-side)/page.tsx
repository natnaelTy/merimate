import MarketingHeader from "@/components/Header";
import MarketingFooter from "@/components/Footer";
import Hero from "@/components/marketing/Hero";
import Features from "@/components/marketing/Features";
import Workflow from "@/components/marketing/Workflow";
import PricingSection from "@/components/marketing/PricingSection";
import CTA from "@/components/marketing/CTA";
import FAQ from "@/components/marketing/faq";

export default function LandingPage() {
  return (
    <div className="pb-24">
      <Hero />
      <Features />
      <Workflow />
      <PricingSection />
      <FAQ />
      <CTA />
    </div>
  );
}
