import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { FacebookIcon } from "@/components/ui/social-icons";
import { CookieSettingsLink } from "@/components/layout/CookieSettingsLink";
import type { FooterColumnData, FooterContactData, FooterConfigData } from "@/lib/queries/footer";

const socialLinks = [
  { href: "https://www.facebook.com/MillimedThailand.20/", label: "Millimed Thailand" },
  { href: "https://www.facebook.com/neocahealthcare/", label: "Neoca" },
  { href: "https://www.facebook.com/iherbbrand", label: "I-Herb" },
];

export function Footer({
  columns,
  contact,
  config,
}: {
  columns: FooterColumnData[];
  contact: FooterContactData | null;
  config: FooterConfigData | null;
}) {
  const copyright = config?.copyrightTh || `© ${new Date().getFullYear()} Millimed. All rights reserved.`;
  const shownColumns = columns.slice(0, config?.desktopColumns ?? columns.length);
  const showContact = Boolean(contact && (contact.phone || contact.email || contact.address));

  const themeVars = config
    ? ({ "--footer-link": config.textColor, "--footer-link-hover": config.accentColor } as CSSProperties)
    : undefined;

  return (
    <footer
      className={config ? "mt-auto" : "mt-auto bg-brand-navy-dark text-white/80"}
      style={config ? { backgroundColor: config.bgColor, color: config.textColor, ...themeVars } : undefined}
    >
      <Container className="flex flex-col gap-8 py-10 lg:flex-row lg:flex-nowrap lg:items-start lg:gap-6 lg:py-12">
        <div className="flex min-w-0 flex-col gap-3 lg:flex-1 lg:basis-0">
          <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-white px-2.5 py-1.5">
            <Image src="/logo-full.png" alt="Millimed" width={128} height={91} className="h-9 w-auto object-contain" />
          </div>
          {contact?.tagline && (
            <p className={config ? "text-sm italic opacity-70" : "text-sm italic text-white/60"}>
              &ldquo;{contact.tagline}&rdquo;
            </p>
          )}
          <p className="text-sm leading-relaxed">
            ผู้ผลิตและจำหน่ายผลิตภัณฑ์เวชภัณฑ์และการดูแลสุขภาพชั้นนำของไทย
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
            {socialLinks.map(({ href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  config
                    ? "inline-flex items-center gap-2 text-sm opacity-70 transition-opacity hover:opacity-100"
                    : "inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
                }
              >
                <FacebookIcon className="h-5 w-5 shrink-0" />
                <span>{label}</span>
              </a>
            ))}
          </div>
        </div>

        {shownColumns.map((column) => (
          <div key={column.id} className="min-w-0 lg:flex-1 lg:basis-0">
            <h3 className={config ? "mb-3 text-sm font-semibold" : "mb-3 text-sm font-semibold text-white"}>
              {column.title}
            </h3>
            <ul className="flex flex-col gap-2 text-sm">
              {column.links.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    className={
                      config
                        ? "transition-colors [color:var(--footer-link)] hover:[color:var(--footer-link-hover)]"
                        : "transition-colors hover:text-white"
                    }
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {showContact && contact && (
          <div className="min-w-0 lg:flex-1 lg:basis-0">
            <h3 className={config ? "mb-3 text-sm font-semibold" : "mb-3 text-sm font-semibold text-white"}>
              ติดต่อเรา
            </h3>
            <div className="flex flex-col gap-2 text-sm leading-relaxed">
              {contact.phone && <p>โทร: {contact.phone}</p>}
              {contact.email && <p>อีเมล: {contact.email}</p>}
              {contact.address
                ?.split("\n")
                .filter(Boolean)
                .map((line, i) => <p key={i}>{line}</p>)}
            </div>
          </div>
        )}
      </Container>

      <div
        className={config ? "border-t py-5" : "border-t border-white/10 py-5"}
        style={config ? { borderColor: config.accentColor + "33" } : undefined}
      >
        <Container
          className={
            config
              ? "flex flex-col items-center gap-2 text-center text-xs opacity-70 sm:flex-row sm:justify-between"
              : "flex flex-col items-center gap-2 text-center text-xs text-white/50 sm:flex-row sm:justify-between"
          }
        >
          <span>{copyright}</span>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy-policy"
              className={
                config
                  ? "transition-colors [color:var(--footer-link)] hover:[color:var(--footer-link-hover)]"
                  : "transition-colors hover:text-white"
              }
            >
              นโยบายความเป็นส่วนตัว
            </Link>
            <Link
              href="/cookie-policy"
              className={
                config
                  ? "transition-colors [color:var(--footer-link)] hover:[color:var(--footer-link-hover)]"
                  : "transition-colors hover:text-white"
              }
            >
              นโยบายการใช้คุกกี้
            </Link>
            <CookieSettingsLink
              className={
                config
                  ? "transition-colors [color:var(--footer-link)] hover:[color:var(--footer-link-hover)]"
                  : "transition-colors hover:text-white"
              }
            />
          </div>
        </Container>
      </div>
    </footer>
  );
}
