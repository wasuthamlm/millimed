import { Page, PageSection } from "@/lib/db/models/index";
import { sequelize } from "@/lib/db/sequelize";
import { notFound } from "@/lib/services/errors";
import type { SectionType } from "@/lib/db/models/PageSection";

export type PageSectionInput = {
  type: SectionType;
  titleTh: string;
  titleEn: string;
  bodyTh: string;
  anchorId: string;
  imageUrl: string;
  videoUrl: string;
  categoryId: string | null;
  itemsToShow: number | null;
  columns: number | null;
  visibleDesktop: boolean;
  visibleTablet: boolean;
  visibleMobile: boolean;
};

export async function saveSections(pageId: string, sections: PageSectionInput[]) {
  const page = await Page.findByPk(pageId);
  if (!page) throw notFound("ไม่พบหน้านี้");

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
        config: {
          anchorId: s.anchorId || undefined,
          imageUrl: s.imageUrl || undefined,
          videoUrl: s.videoUrl || undefined,
          categoryId: s.categoryId || undefined,
        },
      })),
      { transaction: t }
    );
  });

  return page;
}

export async function listSections(pageId: string) {
  return PageSection.findAll({ where: { pageId }, order: [["order", "ASC"]] });
}
