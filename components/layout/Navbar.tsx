"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { NavLink } from "@/data/nav";
import { cn } from "@/lib/utils";
import { NavDropdown } from "./NavDropdown";
import { MobileNav } from "./MobileNav";

export function Navbar({ navLinks }: { navLinks: NavLink[] }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 h-[72px] border-b border-slate-100 bg-white">
      <div className="flex h-full w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="ml-15 flex shrink-0 items-center gap-3">
          <div className="relative h-16 w-24 overflow-hidden sm:w-28">
            <Image src="/logo-full.png" alt="Millimed" fill sizes="(min-width: 640px) 112px, 96px" className="scale-125 object-contain" priority />
          </div>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto [scrollbar-width:none] lg:flex [&::-webkit-scrollbar]:hidden">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            if (link.children) {
              return <NavDropdown key={link.label} link={link} active={active} />;
            }
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-navy text-white"
                    : "text-slate-700 hover:bg-slate-100 hover:text-brand-navy"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <MobileNav navLinks={navLinks} />
        </div>
      </div>
    </header>
  );
}
