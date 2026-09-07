import { SiteSettings, GlobalTheme, Media } from "@/lib/db/models/index";

export type SiteMetaData = {
  siteNameTh: string;
  siteUrl: string | null;
  faviconUrl: string | null;
  seoMetaTitleTh: string | null;
  seoMetaDescTh: string | null;
  gtmId: string | null;
  ga4Id: string | null;
  fbPixelId: string | null;
  tiktokPixelId: string | null;
};

export async function getSiteMeta(): Promise<SiteMetaData> {
  const row = await SiteSettings.findByPk("singleton");
  const favicon = row?.faviconId ? await Media.findByPk(row.faviconId) : null;
  return {
    siteNameTh: row?.siteNameTh || "Millimed",
    siteUrl: row?.siteUrl ?? null,
    faviconUrl: favicon?.url ?? null,
    seoMetaTitleTh: row?.seoMetaTitleTh ?? null,
    seoMetaDescTh: row?.seoMetaDescTh ?? null,
    gtmId: row?.gtmId ?? null,
    ga4Id: row?.ga4Id ?? null,
    fbPixelId: row?.fbPixelId ?? null,
    tiktokPixelId: row?.tiktokPixelId ?? null,
  };
}

export async function getSiteLogo(): Promise<string | null> {
  const row = await SiteSettings.findByPk("singleton");
  if (!row?.logoId) return null;
  const logo = await Media.findByPk(row.logoId);
  return logo?.url ?? null;
}

export type SiteSocialData = {
  facebookUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  tiktokUrl: string | null;
  lineUrl: string | null;
};

export async function getSiteSocial(): Promise<SiteSocialData | null> {
  const row = await SiteSettings.findByPk("singleton");
  if (!row) return null;
  return {
    facebookUrl: row.facebookUrl,
    instagramUrl: row.instagramUrl,
    youtubeUrl: row.youtubeUrl,
    tiktokUrl: row.tiktokUrl,
    lineUrl: row.lineUrl,
  };
}

export type GlobalThemeData = {
  colorPrimary: string;
  colorPrimaryHover: string;
  colorAccent: string;
  colorBackground: string;
  colorText: string;
  buttonRadius: string;
};

export async function getGlobalTheme(): Promise<GlobalThemeData | null> {
  const row = await GlobalTheme.findByPk("singleton");
  if (!row) return null;
  return {
    colorPrimary: row.colorPrimary,
    colorPrimaryHover: row.colorPrimaryHover,
    colorAccent: row.colorAccent,
    colorBackground: row.colorBackground,
    colorText: row.colorText,
    buttonRadius: row.buttonRadius,
  };
}
