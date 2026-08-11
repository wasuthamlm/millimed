"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectionPreviewBody } from "./SectionPreviewBody";
import { XCircleIcon } from "@/components/ui/admin-icons";
import { cn } from "@/lib/utils";
import type { PageSectionRow } from "./types";
import type { NavLink } from "@/data/nav";
import type { FooterColumnData, FooterContactData, FooterConfigData } from "@/lib/queries/footer";
import type { SiteSocialData } from "@/lib/queries/site-settings";
import type { ArticleItem } from "@/data/articles";
import type { NewsItem } from "@/data/news";
import type { HeroBannerItem } from "@/components/home/HeroBanners";

type Device = "desktop" | "tablet" | "mobile";

const deviceWidths: Record<Device, string> = {
  desktop: "max-w-full",
  tablet: "max-w-3xl",
  mobile: "max-w-sm",
};

const deviceLabels: Record<Device, string> = {
  desktop: "Desktop",
  tablet: "Tablet",
  mobile: "Mobile",
};

function isVisible(section: PageSectionRow, device: Device) {
  if (device === "desktop") return section.visibleDesktop;
  if (device === "tablet") return section.visibleTablet;
  return section.visibleMobile;
}

export function PreviewModal({
  sections,
  onClose,
  previewArticles,
  previewNews,
  previewBanners,
  navLinks,
  footerColumns,
  footerContact,
  footerConfig,
  social,
}: {
  sections: PageSectionRow[];
  onClose: () => void;
  previewArticles: ArticleItem[];
  previewNews: NewsItem[];
  previewBanners: HeroBannerItem[];
  navLinks: NavLink[];
  footerColumns: FooterColumnData[];
  footerContact: FooterContactData | null;
  footerConfig: FooterConfigData | null;
  social: SiteSocialData | null;
}) {
  const [device, setDevice] = useState<Device>("desktop");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-8">
      <div className="flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <p className="text-sm font-semibold text-slate-700">ดูตัวอย่างหน้าเว็บ</p>
          <div className="flex items-center gap-2">
            {(Object.keys(deviceLabels) as Device[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setDevice(key)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  device === key ? "bg-brand-navy text-white" : "text-slate-500 hover:bg-slate-100"
                )}
              >
                {deviceLabels[key]}
              </button>
            ))}
            <button
              type="button"
              aria-label="ปิดตัวอย่าง"
              onClick={onClose}
              className="ml-2 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-8">
          <div className={cn("mx-auto overflow-hidden rounded-xl bg-white shadow-lg transition-all", deviceWidths[device])}>
            <Navbar navLinks={navLinks} />
            {sections
              .filter((s) => isVisible(s, device))
              .map((s) => (
                <SectionPreviewBody
                  key={s.id}
                  section={s}
                  previewArticles={previewArticles}
                  previewNews={previewNews}
                  previewBanners={previewBanners}
                />
              ))}
            <Footer columns={footerColumns} contact={footerContact} config={footerConfig} social={social} />
          </div>
        </div>
      </div>
    </div>
  );
}
