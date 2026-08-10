import { Page, PageSection } from "@/lib/db/models/index";
import { calculateSeoAeoGeo, pageToScoreInput } from "@/lib/seo-score";
import { PageManagerClient } from "@/components/admin/pages/PageManagerClient";

export const dynamic = "force-dynamic";

export default async function PageManagerPage({ searchParams }: { searchParams: Promise<{ trash?: string }> }) {
  const { trash } = await searchParams;
  const showTrash = trash === "1";

  const [pages, activeCount, archivedCount] = await Promise.all([
    Page.findAll({ where: { archived: showTrash }, order: [["updatedAt", "DESC"]] }),
    Page.count({ where: { archived: false } }),
    Page.count({ where: { archived: true } }),
  ]);

  const sectionCounts = await PageSection.findAll({
    where: { pageId: pages.map((p) => p.id) },
    attributes: ["pageId"],
  });
  const countByPage = new Map<string, number>();
  for (const row of sectionCounts) {
    countByPage.set(row.pageId, (countByPage.get(row.pageId) ?? 0) + 1);
  }

  const rows = pages.map((page) => ({
    id: page.id,
    slug: page.slug,
    titleTh: page.titleTh,
    titleEn: page.titleEn,
    status: page.status,
    sectionsCount: countByPage.get(page.id) ?? 0,
    seoScore: calculateSeoAeoGeo(
      pageToScoreInput({
        titleTh: page.titleTh,
        titleEn: page.titleEn,
        seoTitle: page.seoTitleTh,
        seoTitleEn: page.seoTitleEn,
        seoDesc: page.seoDescTh,
        seoDescEn: page.seoDescEn,
        slug: page.slug,
        // List view doesn't fetch section bodies; approximate structure depth from the count only.
        sections: Array.from({ length: countByPage.get(page.id) ?? 0 }, () => ({ titleTh: "" })),
      })
    ).seo.score,
  }));

  return <PageManagerClient pages={rows} activeCount={activeCount} archivedCount={archivedCount} showTrash={showTrash} />;
}
