export type SectionType = "hero-banners" | "cta-bar" | "company-intro" | "custom" | "latest-news" | "articles";

export type DeviceVisibility = {
  desktop: boolean;
  tablet: boolean;
  mobile: boolean;
};

export type PageSection = {
  id: string;
  order: number;
  type: SectionType;
  titleTh: string;
  titleEn: string;
  sourceLabel: string;
  visibility: DeviceVisibility;
  columns?: number;
  itemsToShow?: number;
  matchedCount?: number;
  anchorId?: string;
  bodyTh?: string;
  imageUrl?: string;
};
