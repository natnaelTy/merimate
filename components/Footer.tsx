import Image from "next/image";
import { Linkedin, Mail, Twitter } from "lucide-react";
import { Footer } from "@/components/ui/footer";
import ThemeToggle from "@/components/ThemeToggle";

const mainLinks = [
  { label: "Features", href: "/#features" },
  { label: "Workflow", href: "/#workflow" },
  // { label: "Pricing", href: "/pricing" },
  { label: "Sign in", href: "/signin" },
  { label: "Start free", href: "/signup" },
  { label: "Dashboard", href: "/dashboard" },
];

const socialLinks = [
  {
    label: "Email",
    href: "mailto:hello@merimate.com",
    icon: <Mail size={16} />,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com",
    icon: <Linkedin size={16} />,
  },
  { label: "Twitter", href: "https://x.com", icon: <Twitter size={16} /> },
];

const legalLinks = [
  { label: "Support", href: "mailto:hello@merimate.com" },
  { label: "Sign in", href: "/signin" },
];

export default function MarketingFooter() {
  return (
    <Footer
      logo={
        <Image
          src="/merimate.png"
          alt="Merimate logo"
          width={58}
          height={58}
          className="object-cover"
        />
      }
      brandName="Merimate"
      description="Your AI deal teammate for faster, clearer follow-ups."
      socialLinks={socialLinks}
      mainLinks={mainLinks}
      legalLinks={legalLinks}
      copyright={{
        text: `© ${new Date().getFullYear()} Merimate. All rights reserved.`,
      }}
      themeSwitcher={<ThemeToggle />}
    />
  );
}
