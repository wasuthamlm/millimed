import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { NewsHero } from "@/components/news/NewsHero";
import { NewsGrid } from "@/components/news/NewsGrid";
import { getLatestNews } from "@/lib/queries/posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ข่าวสารและกิจกรรม",
  alternates: { canonical: "/news" },
};

export default async function NewsPage() {
  const newsItems = await getLatestNews(50);
  const [featured, ...rest] = newsItems;

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

        {featured && <NewsHero item={featured} />}
        {rest.length > 0 && <NewsGrid items={rest} />}
      </Container>
    </div>
  );
}
