import Link from "next/link";
import type { ReactNode } from "react";

type FooterLink = {
  label: string;
  href: string;
};

type FooterSocial = {
  label: string;
  href: string;
  icon?: ReactNode;
};

export type FooterProps = {
  logo?: ReactNode;
  brandName?: string;
  description?: ReactNode;
  socialLinks?: FooterSocial[];
  mainLinks?: FooterLink[];
  legalLinks?: FooterLink[];
  themeSwitcher?: ReactNode;
  copyright?: {
    text: string;
    license?: string;
  };
};

const isExternalLink = (href: string) =>
  href.startsWith("http") || href.startsWith("mailto:");

const FooterLinkItem = ({ href, label }: FooterLink) =>
  isExternalLink(href) ? (
    <a
      href={href}
      className="text-sm text-muted-foreground transition hover:text-foreground"
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
    >
      {label}
    </a>
  ) : (
    <Link
      href={href}
      className="text-sm text-muted-foreground transition hover:text-foreground"
    >
      {label}
    </Link>
  );

export function Footer({
  logo,
  brandName,
  description,
  socialLinks = [],
  mainLinks = [],
  legalLinks = [],
  themeSwitcher,
  copyright,
}: FooterProps) {
  const mainColumns = mainLinks.reduce<FooterLink[][]>((acc, link, index) => {
    if (index % 3 === 0) acc.push([]);
    acc[acc.length - 1].push(link);
    return acc;
  }, []);

  return (
    <footer className="py-16 px-6 border border-border/60 bg-card/80 shadow-sm backdrop-blur">
      <div className="mx-auto max-w-6xl">
        <div>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_2fr]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {logo}
                {brandName ? (
                  <span className="text-lg font-semibold">{brandName}</span>
                ) : null}
              </div>
              {description ? (
                <p className="text-sm text-muted-foreground">{description}</p>
              ) : null}
              {socialLinks.length ? (
                <div className="flex flex-wrap items-center gap-3">
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="rounded-full border border-border/60 p-2 text-muted-foreground transition hover:text-foreground"
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                    >
                      <span className="sr-only">{link.label}</span>
                      {link.icon}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>

            {mainColumns.length ? (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {mainColumns.map((links, columnIndex) => (
                  <div key={columnIndex} className="flex flex-col gap-2">
                    {links.map((link) => (
                      <FooterLinkItem key={link.label} {...link} />
                    ))}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {(legalLinks.length || copyright || themeSwitcher) && (
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-6 text-sm text-muted-foreground">
              <div className="flex flex-wrap gap-4">
                {legalLinks.map((link) => (
                  <FooterLinkItem key={link.label} {...link} />
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {themeSwitcher ? (
                  <div className="flex items-center">{themeSwitcher}</div>
                ) : null}
                {copyright ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{copyright.text}</span>
                    {copyright.license ? <span>{copyright.license}</span> : null}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
