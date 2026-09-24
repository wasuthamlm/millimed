import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { NewsHero } from "@/components/news/NewsHero";
import { NewsGrid } from "@/components/news/NewsGrid";
import { NewsCategoryTabs } from "@/components/news/NewsCategoryTabs";
import { Pager } from "@/components/ui/Pager";
import { getNewsAndActivities, type NewsCategoryFilter } from "@/lib/queries/posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ข่าวสารและกิจกรรม",
  alternates: { canonical: "/news" },
};

const PAGE_SIZE = 12;
const VALID_CATEGORIES: NewsCategoryFilter[] = ["all", "company", "csr", "internal"];

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const category = VALID_CATEGORIES.includes(params.category as NewsCategoryFilter)
    ? (params.category as NewsCategoryFilter)
    : "all";

  const { items, totalPages } = await getNewsAndActivities({ page, pageSize: PAGE_SIZE, category });

  const showHero = category === "all" && page === 1;
  const featured = showHero ? items[0] : undefined;
  const rest = showHero ? items.slice(1) : items;

  return (
    <div className="bg-slate-50">
      <Container className="flex flex-col gap-10 py-14 sm:py-20">
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">ข่าวสารและกิจกรรม</h1>
          <span className="h-1 w-16 rounded-full bg-brand-gold" aria-hidden="true" />
          <p className="max-w-xl text-sm text-slate-500 sm:text-base">
            ติดตามความเคลื่อนไหว ข่าวสาร และกิจกรรมล่าสุดจากมิลลิเมด
          </p>
        </div>

        <NewsCategoryTabs active={category} />

        {featured && <NewsHero item={featured} />}
        {rest.length > 0 ? (
          <NewsGrid items={rest} />
        ) : (
          !featured && <p className="py-10 text-center text-slate-500">ยังไม่มีข่าวสารในหมวดนี้</p>
        )}

        <Pager page={page} totalPages={totalPages} basePath="/news" extraParams={{ category: category === "all" ? undefined : category }} />
      </Container>
    </div>
  );
}
