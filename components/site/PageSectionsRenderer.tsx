import { Container } from "@/components/ui/Container";
import { HeroBanners } from "@/components/home/HeroBanners";
import { LatestNews } from "@/components/home/LatestNews";
import { ArticlesGrid } from "@/components/home/ArticlesGrid";
import { getActiveBanners } from "@/lib/queries/banners";
import { getLatestNews, getLatestArticles } from "@/lib/queries/posts";
import type { PageSectionData } from "@/lib/queries/pages";

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
      const items = await getLatestArticles(section.itemsToShow ?? 8);
      return <ArticlesGrid title={section.titleTh ?? undefined} items={items} />;
    }
    case "CTA_BAR":
    case "COMPANY_INTRO":
    case "CUSTOM":
    default:
      return (
        <section className="py-14 sm:py-20">
          <Container className="flex flex-col items-center gap-4 text-center">
            {section.titleTh && (
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">{section.titleTh}</h2>
            )}
            {section.bodyTh && (
              <p className="max-w-2xl whitespace-pre-line text-base leading-relaxed text-slate-600">
                {section.bodyTh}
              </p>
            )}
          </Container>
        </section>
      );
  }
}

export async function PageSectionsRenderer({ sections }: { sections: PageSectionData[] }) {
  const rendered = await Promise.all(sections.map((section) => renderSection(section)));
  return <>{rendered.map((node, i) => <div key={sections[i].id}>{node}</div>)}</>;
}
