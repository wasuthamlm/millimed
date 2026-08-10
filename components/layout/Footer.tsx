import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { FacebookIcon, InstagramIcon, YoutubeIcon, TikTokIcon, LineIcon } from "@/components/ui/social-icons";
import type { FooterColumnData, FooterContactData, FooterConfigData } from "@/lib/queries/footer";
import type { SiteSocialData } from "@/lib/queries/site-settings";

export function Footer({
  columns,
  contact,
  config,
  social,
}: {
  columns: FooterColumnData[];
  contact: FooterContactData | null;
  config: FooterConfigData | null;
  social: SiteSocialData | null;
}) {
  const socialLinks = social
    ? [
        { href: social.facebookUrl, Icon: FacebookIcon, label: "Facebook" },
        { href: social.instagramUrl, Icon: InstagramIcon, label: "Instagram" },
        { href: social.youtubeUrl, Icon: YoutubeIcon, label: "YouTube" },
        { href: social.tiktokUrl, Icon: TikTokIcon, label: "TikTok" },
        { href: social.lineUrl, Icon: LineIcon, label: "LINE" },
      ].filter((item): item is { href: string; Icon: typeof FacebookIcon; label: string } => !!item.href)
    : [];

  const copyright = config?.copyrightTh || `© ${new Date().getFullYear()} Millimed. All rights reserved.`;
  const gridColsClass =
    config?.desktopColumns === 1
      ? "lg:grid-cols-2"
      : config?.desktopColumns === 2
        ? "lg:grid-cols-3"
        : config?.desktopColumns === 4
          ? "lg:grid-cols-5"
          : "lg:grid-cols-4";

  const themeVars = config
    ? ({ "--footer-link": config.textColor, "--footer-link-hover": config.accentColor } as CSSProperties)
    : undefined;

  return (
    <footer
      className={config ? "mt-auto" : "mt-auto bg-brand-navy-dark text-white/80"}
      style={config ? { backgroundColor: config.bgColor, color: config.textColor, ...themeVars } : undefined}
    >
      <Container className={`grid gap-10 py-14 sm:grid-cols-2 ${gridColsClass}`}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Millimed" width={32} height={32} />
            <span className={config ? "text-lg font-bold" : "text-lg font-bold text-white"}>Millimed</span>
          </div>
          {contact?.tagline && (
            <p className={config ? "text-sm italic opacity-70" : "text-sm italic text-white/60"}>
              &ldquo;{contact.tagline}&rdquo;
            </p>
          )}
          <p className="text-sm leading-relaxed">
            ผู้ผลิตและจำหน่ายผลิตภัณฑ์เวชภัณฑ์และการดูแลสุขภาพชั้นนำของไทย
          </p>
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-3 pt-1">
              {socialLinks.map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={
                    config
                      ? "opacity-70 transition-opacity hover:opacity-100"
                      : "text-white/60 transition-colors hover:text-white"
                  }
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          )}
        </div>

        {columns.slice(0, config?.desktopColumns ?? columns.length).map((column) => (
          <div key={column.id}>
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

        {contact && (contact.phone || contact.email || contact.address) && (
          <div>
            <h3 className={config ? "mb-3 text-sm font-semibold" : "mb-3 text-sm font-semibold text-white"}>
              ติดต่อเรา
            </h3>
            <ul className="flex flex-col gap-2 text-sm">
              {contact.phone && <li>โทร: {contact.phone}</li>}
              {contact.email && <li>อีเมล: {contact.email}</li>}
              {contact.address && <li>{contact.address}</li>}
            </ul>
          </div>
        )}
      </Container>

      <div
        className={config ? "border-t py-5" : "border-t border-white/10 py-5"}
        style={config ? { borderColor: config.accentColor + "33" } : undefined}
      >
        <Container className={config ? "text-center text-xs opacity-70" : "text-center text-xs text-white/50"}>
          {copyright}
        </Container>
      </div>
    </footer>
  );
}
