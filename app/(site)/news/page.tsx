import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { NewsFeatured } from "@/components/news/NewsFeatured";
import { NewsCard } from "@/components/news/NewsCard";
import { getLatestNews } from "@/lib/queries/posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ข่าวสาร",
  alternates: { canonical: "/news" },
};

export default async function NewsPage() {
  const newsItems = await getLatestNews(50);
  const [featured, ...secondary] = newsItems;

  return (
    <Container className="flex flex-col gap-8 py-14 sm:py-20">
      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">ข่าวสาร</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        {featured && <NewsFeatured item={featured} />}
        <div className="flex flex-col gap-4">
          {secondary.map((item) => (
            <NewsCard key={item.slug} item={item} />
          ))}
        </div>
      </div>
    </Container>
  );
}
