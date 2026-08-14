import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { HeroBanners } from "@/components/home/HeroBanners";
import { LatestNews } from "@/components/home/LatestNews";
import { ArticlesGrid } from "@/components/home/ArticlesGrid";
import { BlockBodyText } from "@/components/site/BlockBodyText";
import { getActiveBanners } from "@/lib/queries/banners";
import { getLatestNews, getLatestArticles, getArticlesByCategory } from "@/lib/queries/posts";
import { cn } from "@/lib/utils";
import type { PageSectionData } from "@/lib/queries/pages";

function visibilityClass(section: PageSectionData) {
  return cn(
    section.visibleMobile ? "block" : "hidden",
    section.visibleTablet ? "md:block" : "md:hidden",
    section.visibleDesktop ? "lg:block" : "lg:hidden"
  );
}

async function renderSection(section: PageSectionData) {
  switch (section.type) {
    case "HERO_BANNERS": {
      const banners = await getActiveBanners();
      return <HeroBanners banners={banners} />;
    }
    case "LATEST_NEWS": {
      const items = await getLatestNews(section.itemsToShow ?? 3);
      return <LatestNews title={section.titleTh ?? undefined} items={items} />;
    }
    case "ARTICLES": {
      const items = section.categoryId
        ? await getArticlesByCategory(section.categoryId, section.itemsToShow ?? 100)
        : await getLatestArticles(section.itemsToShow ?? 8);
      return <ArticlesGrid title={section.titleTh ?? undefined} items={items} columns={section.columns ?? undefined} />;
    }
    case "CTA_BAR":
      // Legacy block type kept only for backward compat with old saved rows — intentionally renders nothing.
      return null;
    case "COMPANY_INTRO":
    case "CUSTOM":
    default:
      if (!section.titleTh && !section.bodyTh && !section.imageUrl) return null;
      return (
        <section className="py-14 sm:py-20">
          <Container className="flex flex-col items-center gap-4 text-center">
            {section.titleTh && (
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">{section.titleTh}</h2>
            )}
            {section.imageUrl && (
              <div className="relative aspect-video w-full max-w-2xl overflow-hidden rounded-2xl">
                <Image src={section.imageUrl} alt={section.titleTh ?? ""} fill unoptimized sizes="(min-width: 768px) 672px, 100vw" className="object-cover" />
              </div>
            )}
            {section.bodyTh && (
              <BlockBodyText
                text={section.bodyTh}
                className="max-w-2xl text-base leading-relaxed text-slate-600 [&_ul]:text-left"
              />
            )}
          </Container>
        </section>
      );
  }
}

export async function PageSectionsRenderer({ sections }: { sections: PageSectionData[] }) {
  const rendered = await Promise.all(sections.map((section) => renderSection(section)));
  return (
    <>
      {rendered.map((node, i) =>
        node ? (
          <div key={sections[i].id} id={sections[i].anchorId ?? undefined} className={visibilityClass(sections[i])}>
            {node}
          </div>
        ) : null
      )}
    </>
  );
}
