import { SiteSettings, GlobalTheme } from "@/lib/db/models/index";

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
