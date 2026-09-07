import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsIcon } from "@/components/ui/admin-icons";
import { SettingsManager } from "@/components/admin/site/SettingsManager";
import * as siteSettingsService from "@/lib/services/site-settings";

export const metadata: Metadata = { title: "การตั้งค่า" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [{ settings, logoUrl, faviconUrl, loginBgUrl }, theme] = await Promise.all([
    siteSettingsService.getSiteSettings(),
    siteSettingsService.getGlobalTheme(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={SettingsIcon} title="การตั้งค่า" subtitle="ตั้งค่าข้อมูลเว็บไซต์ SEO, Tracking, โซเชียลมีเดีย และธีมสีทั้งเว็บไซต์" />
      <SettingsManager
        initialSettings={{
          siteNameTh: settings?.siteNameTh ?? "Millimed",
          siteNameEn: settings?.siteNameEn ?? "",
          siteUrl: settings?.siteUrl ?? "",
          logo: logoUrl,
          favicon: faviconUrl,
          loginBg: loginBgUrl,
          youtubeEmbedUrl: settings?.youtubeEmbedUrl ?? "",
          gtmId: settings?.gtmId ?? "",
          ga4Id: settings?.ga4Id ?? "",
          fbPixelId: settings?.fbPixelId ?? "",
          tiktokPixelId: settings?.tiktokPixelId ?? "",
          seoMetaTitleTh: settings?.seoMetaTitleTh ?? "",
          seoMetaDescTh: settings?.seoMetaDescTh ?? "",
          facebookUrl: settings?.facebookUrl ?? "",
          instagramUrl: settings?.instagramUrl ?? "",
          youtubeUrl: settings?.youtubeUrl ?? "",
          tiktokUrl: settings?.tiktokUrl ?? "",
          lineUrl: settings?.lineUrl ?? "",
          socialIconStyle: settings?.socialIconStyle ?? "filled",
          showSocialInHeader: settings?.showSocialInHeader ?? false,
        }}
        initialTheme={{
          fontHeader: theme?.fontHeader ?? "thai",
          fontBody: theme?.fontBody ?? "thai",
          colorPrimary: theme?.colorPrimary ?? "#16296b",
          colorPrimaryHover: theme?.colorPrimaryHover ?? "#0d1a4a",
          colorAccent: theme?.colorAccent ?? "#f5b301",
          colorBackground: theme?.colorBackground ?? "#ffffff",
          colorText: theme?.colorText ?? "#171717",
          buttonRadius: theme?.buttonRadius ?? "9999px",
        }}
      />
    </div>
  );
}
