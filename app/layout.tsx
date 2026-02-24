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
  title: "Merimate",
  description: "Freelancer CRM + AI follow-up assistant",
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
