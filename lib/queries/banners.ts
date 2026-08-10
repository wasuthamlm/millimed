import { Banner, Media } from "@/lib/db/models/index";
import type { HeroBannerItem } from "@/components/home/HeroBanners";

export async function getActiveBanners(): Promise<HeroBannerItem[]> {
  const rows = await Banner.findAll({
    where: { active: true },
    order: [["order", "ASC"]],
    include: [{ model: Media, as: "image" }],
  });

  return rows.map((row) => ({
    id: row.id,
    titleTh: row.titleTh,
    image: (row.get("image") as Media | null)?.url ?? "/images/placeholder-banner-1.png",
    link: row.link,
  }));
}
