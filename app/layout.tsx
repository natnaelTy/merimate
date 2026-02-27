import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/dashboard/AppShell";
import { ThemeProviderWrapper } from "@/components/ThemeProviderWrapprer";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const sans = Inter({
  variable: "--font-display",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
      "http://localhost:3000"
  ),
  title: {
    default: "Merimate — AI CRM for freelancers",
    template: "%s | Merimate",
  },
  description:
    "Merimate is the AI-powered CRM for freelancers. Track leads, follow-ups, and proposals in one clean dashboard to close more clients.",
  applicationName: "Merimate",
  category: "Business",
  keywords: [
    "freelancer CRM",
    "lead tracking",
    "proposal tracking",
    "client follow-up",
    "pipeline management",
    "AI email assistant",
    "freelancer workflow",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Merimate",
    title: "Merimate — AI CRM for freelancers",
    description:
      "Track leads, automate follow-ups, and keep your pipeline moving with Merimate's AI-first freelancer CRM.",
    images: [
      {
        url: "/merimate.png",
        width: 512,
        height: 512,
        alt: "Merimate logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Merimate — AI CRM for freelancers",
    description:
      "Track leads, automate follow-ups, and keep your pipeline moving with Merimate's AI-first freelancer CRM.",
    images: ["/merimate.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable} antialiased`}>
        <ThemeProviderWrapper>
          <TooltipProvider>
            <AppShell>{children}</AppShell>
            <Toaster position="top-right" richColors />
          </TooltipProvider>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
