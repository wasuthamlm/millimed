import Image from "next/image";
import { LatestNews } from "@/components/home/LatestNews";
import { ArticlesGrid } from "@/components/home/ArticlesGrid";
import { BlockBodyText } from "@/components/site/BlockBodyText";
import { toYoutubeEmbedUrl } from "@/lib/utils";
import type { ArticleItem } from "@/data/articles";
import type { NewsItem } from "@/data/news";
import type { HeroBannerItem } from "@/components/home/HeroBanners";
import type { PageSectionRow } from "./types";

export function SectionPreviewBody({
  section,
  previewArticles,
  previewNews,
  previewBanners,
}: {
  section: PageSectionRow;
  previewArticles: ArticleItem[];
  previewNews: NewsItem[];
  previewBanners: HeroBannerItem[];
}) {
  switch (section.type) {
    case "HERO_BANNERS": {
      const active = previewBanners[0];
      if (!active) {
        return (
          <div className="flex h-48 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50 text-sm text-slate-400">
            ยังไม่มี Banner ที่เปิดใช้งาน
          </div>
        );
      }
      return (
        <div className="relative h-48 w-full sm:h-64">
          <Image src={active.image} alt={active.titleTh} fill sizes="100vw" className="object-cover" unoptimized />
        </div>
      );
    }
    case "CTA_BAR":
      return (
        <div className="flex h-16 items-center justify-center bg-slate-50 text-sm text-slate-400">
          แถบนี้ไม่แสดงผลจริง — บล็อกประเภทนี้ถูกปิดใช้งานถาวรแล้ว
        </div>
      );
    case "COMPANY_INTRO":
    case "CUSTOM": {
      const embedUrl = section.videoUrl ? toYoutubeEmbedUrl(section.videoUrl) : null;
      return (
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-6 py-6">
          {section.titleTh ? (
            <h3 className="text-center text-xl font-bold text-slate-900">{section.titleTh}</h3>
          ) : (
            <p className="text-center text-xl font-medium text-slate-300">พิมพ์หัวข้อที่นี่...</p>
          )}
          {embedUrl ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-900">
              <iframe
                src={embedUrl}
                title={section.titleTh || "วิดีโอ"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          ) : section.videoUrl ? (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">ไม่สามารถอ่านลิงก์วิดีโอนี้ได้ ตรวจสอบว่าเป็นลิงก์ YouTube ที่ถูกต้อง</p>
          ) : (
            section.imageUrl && (
              <div className="relative w-full overflow-hidden rounded-lg bg-slate-100">
                <Image
                  src={section.imageUrl}
                  alt={section.titleTh || ""}
                  width={1200}
                  height={800}
                  unoptimized
                  className="h-auto w-full object-contain"
                />
              </div>
            )
          )}
          {section.bodyTh ? (
            <BlockBodyText text={section.bodyTh} className="text-sm text-slate-600" />
          ) : (
            <p className="text-sm text-slate-400">ยังไม่มีเนื้อหา — คลิกเพื่อแก้ไขในแผงด้านขวา</p>
          )}
        </div>
      );
    }
    case "LATEST_NEWS":
      return <LatestNews title={section.titleTh || undefined} items={previewNews.slice(0, section.itemsToShow ?? 3)} />;
    case "ARTICLES": {
      const filtered = section.categoryId ? previewArticles.filter((a) => a.categoryId === section.categoryId) : previewArticles;
      return (
        <ArticlesGrid
          title={section.titleTh || undefined}
          items={filtered.slice(0, section.itemsToShow ?? 8)}
          columns={section.columns ?? undefined}
        />
      );
    }
    default:
      return null;
  }
}
