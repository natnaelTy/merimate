import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/dashboard/AppShell";
import { ThemeProviderWrapper } from "@/components/ThemeProviderWrapprer";
import { TooltipProvider } from "@/components/ui/tooltip";


const sans = Inter({
  variable: "--font-display",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Merimate",
  description: "Freelancer CRM + AI follow-up assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable} antialiased`}>
        <ThemeProviderWrapper>
          <TooltipProvider>
            <AppShell>{children}</AppShell>
          </TooltipProvider>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
