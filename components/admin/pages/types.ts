import type { SectionType } from "@/lib/db/models/PageSection";

export type { SectionType };

export type PageSectionRow = {
  id: string;
  type: SectionType;
  titleTh: string;
  titleEn: string;
  bodyTh: string;
  anchorId: string;
  imageUrl: string;
  categoryId: string | null;
  itemsToShow: number | null;
  columns: number | null;
  visibleDesktop: boolean;
  visibleTablet: boolean;
  visibleMobile: boolean;
};
