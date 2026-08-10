"use server";

import { revalidatePath } from "next/cache";
import { Banner, SiteBannerConfig, sequelize } from "@/lib/db/models/index";
import { requireAdmin } from "@/lib/require-admin";
import { getOrCreateMedia } from "@/lib/media";
import type { Banner as BannerData } from "@/data/admin-banners";

export type BannerConfigInput = {
  transitionEffect: string;
  direction: string;
  transitionSpeedMs: number;
  displayDurationMs: number;
  autoplay: boolean;
  loop: boolean;
  pauseOnHover: boolean;
  showArrows: boolean;
  showDots: boolean;
};

export async function saveBannerConfig(input: BannerConfigInput) {
  await requireAdmin();

  const [row] = await SiteBannerConfig.findOrCreate({ where: { id: "singleton" }, defaults: { id: "singleton", ...input } });
  await row.update(input);

  revalidatePath("/admin/site/banners");
  revalidatePath("/", "layout");
}

export async function saveBanners(banners: BannerData[]) {
  await requireAdmin();

  await sequelize.transaction(async (t) => {
    await Banner.destroy({ where: {}, transaction: t });
    for (let i = 0; i < banners.length; i++) {
      const banner = banners[i];
      const media = await getOrCreateMedia(banner.image);
      await Banner.create({ titleTh: banner.titleTh, imageId: media.id, link: banner.link, order: i, active: banner.active }, { transaction: t });
    }
  });

  revalidatePath("/admin/site/banners");
  revalidatePath("/", "layout");
}
