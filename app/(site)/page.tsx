import type { Metadata } from "next";
import { HeroBanners } from "@/components/home/HeroBanners";
import { LatestNews } from "@/components/home/LatestNews";
import { ArticlesGrid } from "@/components/home/ArticlesGrid";
import { getActiveBanners } from "@/lib/queries/banners";
import { getLatestNews, getLatestArticles } from "@/lib/queries/posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const [banners, news, articles] = await Promise.all([
    getActiveBanners(),
    getLatestNews(3),
    getLatestArticles(8),
  ]);

  return (
    <>
      <HeroBanners banners={banners} />
      <LatestNews items={news} />
      <ArticlesGrid items={articles} />
    </>
  );
}
