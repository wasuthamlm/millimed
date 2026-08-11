import { Page, PageSection } from "@/lib/db/models/index";

export type PageSectionData = {
  id: string;
  order: number;
  type: PageSection["type"];
  titleTh: string | null;
  titleEn: string | null;
  bodyTh: string | null;
  itemsToShow: number | null;
  columns: number | null;
  visibleDesktop: boolean;
  visibleTablet: boolean;
  visibleMobile: boolean;
  anchorId: string | null;
  imageUrl: string | null;
};

export type PageData = {
  slug: string;
  titleTh: string;
  sections: PageSectionData[];
};

export async function getPageBySlug(slug: string): Promise<PageData | null> {
  const page = await Page.findOne({ where: { slug, status: "PUBLISHED", archived: false } });
  if (!page) return null;

  const sections = await PageSection.findAll({ where: { pageId: page.id }, order: [["order", "ASC"]] });

  return {
    slug: page.slug,
    titleTh: page.titleTh,
    sections: sections.map((s) => {
      const config = (s.config ?? {}) as { anchorId?: string; imageUrl?: string };
      return {
        id: s.id,
        order: s.order,
        type: s.type,
        titleTh: s.titleTh,
        titleEn: s.titleEn,
        bodyTh: s.bodyTh,
        itemsToShow: s.itemsToShow,
        columns: s.columns,
        visibleDesktop: s.visibleDesktop,
        visibleTablet: s.visibleTablet,
        visibleMobile: s.visibleMobile,
        anchorId: config.anchorId || null,
        imageUrl: config.imageUrl || null,
      };
    }),
  };
}
