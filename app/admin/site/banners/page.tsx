import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { ImageIcon } from "@/components/ui/admin-icons";
import { BannersManager } from "@/components/admin/site/BannersManager";
import { BannerAppearanceForm } from "@/components/admin/site/BannerAppearanceForm";
import { Banner, Media, SiteBannerConfig } from "@/lib/db/models/index";
import type { Banner as BannerData } from "@/data/admin-banners";
import type { BannerConfigInput } from "./actions";

export const metadata: Metadata = { title: "จัดการ Banners" };
export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const [rows, config] = await Promise.all([
    Banner.findAll({ order: [["order", "ASC"]], include: [{ model: Media, as: "image" }] }),
    SiteBannerConfig.findByPk("singleton"),
  ]);

  const initialBanners: BannerData[] = rows.map((row) => ({
    id: row.id,
    titleTh: row.titleTh,
    image: (row.get("image") as Media | null)?.url ?? "/images/placeholder-banner-1.png",
    link: row.link ?? "/",
    order: row.order,
    active: row.active,
  }));

  const initialConfig: BannerConfigInput = {
    transitionEffect: config?.transitionEffect ?? "fade",
    direction: config?.direction ?? "ltr",
    transitionSpeedMs: config?.transitionSpeedMs ?? 500,
    displayDurationMs: config?.displayDurationMs ?? 5000,
    autoplay: config?.autoplay ?? true,
    loop: config?.loop ?? true,
    pauseOnHover: config?.pauseOnHover ?? false,
    showArrows: config?.showArrows ?? false,
    showDots: config?.showDots ?? true,
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={ImageIcon} title={`จัดการ Banners (${initialBanners.length} แบนเนอร์)`} subtitle="จัดการภาพสไลด์ที่แสดงในส่วน Hero Banners ของหน้าแรก" />
      <BannerAppearanceForm initial={initialConfig} />
      <BannersManager initialBanners={initialBanners} />
    </div>
  );
}
