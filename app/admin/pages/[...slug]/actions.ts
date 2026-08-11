"use server";

import { revalidatePath } from "next/cache";
import { Page, PageSection } from "@/lib/db/models/index";
import { sequelize } from "@/lib/db/sequelize";
import { requireAdmin } from "@/lib/require-admin";
import type { SectionType } from "@/lib/db/models/PageSection";

export type PageSectionInput = {
  type: SectionType;
  titleTh: string;
  titleEn: string;
  bodyTh: string;
  anchorId: string;
  imageUrl: string;
  itemsToShow: number | null;
  columns: number | null;
  visibleDesktop: boolean;
  visibleTablet: boolean;
  visibleMobile: boolean;
};

export async function saveSections(pageId: string, sections: PageSectionInput[]): Promise<{ error?: string }> {
  await requireAdmin();

  const page = await Page.findByPk(pageId);
  if (!page) return { error: "ไม่พบหน้านี้" };

  await sequelize.transaction(async (t) => {
    await PageSection.destroy({ where: { pageId }, transaction: t });
    await PageSection.bulkCreate(
      sections.map((s, i) => ({
        pageId,
        order: i,
        type: s.type,
        titleTh: s.titleTh || null,
        titleEn: s.titleEn || null,
        bodyTh: s.bodyTh || null,
        itemsToShow: s.itemsToShow,
        columns: s.columns,
        visibleDesktop: s.visibleDesktop,
        visibleTablet: s.visibleTablet,
        visibleMobile: s.visibleMobile,
        config: { anchorId: s.anchorId || undefined, imageUrl: s.imageUrl || undefined },
      })),
      { transaction: t }
    );
  });

  revalidatePath(`/admin/pages/${page.slug}`);
  revalidatePath("/", "layout");
  return {};
}
