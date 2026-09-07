import { z } from "zod";
import { SiteSettings, GlobalTheme, Media } from "@/lib/db/models/index";
import { getOrCreateMedia } from "@/lib/media";
import { validationError } from "@/lib/services/errors";
import type { SiteSettingsInput, GlobalThemeInput } from "@/data/admin-settings";

export async function getSiteSettings() {
  const settings = await SiteSettings.findByPk("singleton");
  const [logo, favicon, loginBg] = await Promise.all([
    settings?.logoId ? Media.findByPk(settings.logoId) : null,
    settings?.faviconId ? Media.findByPk(settings.faviconId) : null,
    settings?.loginBgId ? Media.findByPk(settings.loginBgId) : null,
  ]);
  return { settings, logoUrl: logo?.url ?? "", faviconUrl: favicon?.url ?? "", loginBgUrl: loginBg?.url ?? "" };
}

export async function getGlobalTheme() {
  return GlobalTheme.findByPk("singleton");
}

// Feeds `new URL()` in the root layout's generateMetadata — must be a full absolute URL or empty.
const absoluteUrl = z
  .string()
  .trim()
  .refine((v) => v === "" || /^https?:\/\//i.test(v), "ต้องเป็น URL เต็มรูปแบบ (ขึ้นต้นด้วย https://) หรือเว้นว่างไว้");

// Feeds next/image `src` — must be an absolute URL or a root-relative path, or empty.
const imageUrl = z
  .string()
  .trim()
  .refine((v) => v === "" || /^https?:\/\//i.test(v) || v.startsWith("/"), "URL รูปภาพไม่ถูกต้อง");

const siteSettingsSchema = z.object({
  siteUrl: absoluteUrl,
  logo: imageUrl,
  favicon: imageUrl,
  loginBg: imageUrl,
});

export async function saveSiteSettings(input: SiteSettingsInput) {
  const parsed = siteSettingsSchema.safeParse(input);
  if (!parsed.success) throw validationError(parsed.error);

  const [logoId, faviconId, loginBgId] = await Promise.all([
    input.logo ? getOrCreateMedia(input.logo).then((m) => m.id) : undefined,
    input.favicon ? getOrCreateMedia(input.favicon).then((m) => m.id) : undefined,
    input.loginBg ? getOrCreateMedia(input.loginBg).then((m) => m.id) : undefined,
  ]);

  const data = {
    siteNameTh: input.siteNameTh,
    siteNameEn: input.siteNameEn || null,
    siteUrl: input.siteUrl || null,
    logoId: logoId ?? null,
    faviconId: faviconId ?? null,
    loginBgId: loginBgId ?? null,
    youtubeEmbedUrl: input.youtubeEmbedUrl || null,
    gtmId: input.gtmId || null,
    ga4Id: input.ga4Id || null,
    fbPixelId: input.fbPixelId || null,
    tiktokPixelId: input.tiktokPixelId || null,
    seoMetaTitleTh: input.seoMetaTitleTh || null,
    seoMetaDescTh: input.seoMetaDescTh || null,
    facebookUrl: input.facebookUrl || null,
    instagramUrl: input.instagramUrl || null,
    youtubeUrl: input.youtubeUrl || null,
    tiktokUrl: input.tiktokUrl || null,
    lineUrl: input.lineUrl || null,
    socialIconStyle: input.socialIconStyle,
    showSocialInHeader: input.showSocialInHeader,
  };

  const [row] = await SiteSettings.findOrCreate({ where: { id: "singleton" }, defaults: { id: "singleton", ...data } });
  await row.update(data);
  return row;
}

export async function saveGlobalTheme(input: GlobalThemeInput) {
  const [row] = await GlobalTheme.findOrCreate({ where: { id: "singleton" }, defaults: { id: "singleton", ...input } });
  await row.update(input);
  return row;
}
