"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function NavBar() {
  const [showNavBar, setShowNavBar] = useState(false);

  useEffect(() => {
    function handleHeaderChange() {
      if (window.scrollY >= 60) {
        setShowNavBar(true);
      } else {
        setShowNavBar(false);
      }
    }

    window.addEventListener("scroll", handleHeaderChange);
    return () => {
      window.removeEventListener("scroll", handleHeaderChange);
    };
  }, []);

  return (
    <nav
      className={
        showNavBar
          ? "flex items-center justify-between w-full py-4 md:py-10 fixed shadow-sm top-0 left-0 z-10 h-16 px-2 backdrop-blur-sm bg-background/80 transition-all duration-300 ease-out"
          : "bg-transparent flex items-center justify-between w-full py-4 md:py-10 fixed top-0 left-0 z-10 h-16 px-2 transition-all duration-300 ease-out"
      }
    >
      <div className="max-w-6xl w-full flex items-center justify-between mx-auto px-1 md:px-3">
        <Link href="/">
          <Image
            src="/merimate.png"
            alt="Merimate logo"
            width={60}
            height={60}
            className="object-cover"
          />
        </Link>

        <div className="hidden md:flex flex-1 items-center justify-center gap-6 text-sm font-medium text-muted-foreground">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
    </nav>
  );
}
