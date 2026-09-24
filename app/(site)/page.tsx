import type { Metadata } from "next";
import { HeroBanners } from "@/components/home/HeroBanners";
import { LatestNews } from "@/components/home/LatestNews";
import { ActivitiesSection } from "@/components/home/ActivitiesSection";
import { AdvertisementsSection } from "@/components/home/AdvertisementsSection";
import { getActiveBanners } from "@/lib/queries/banners";
import { getLatestNews, getLatestActivities } from "@/lib/queries/posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const [banners, news, activities] = await Promise.all([
    getActiveBanners(),
    getLatestNews(3),
    getLatestActivities(6),
  ]);

  return (
    <>
      <HeroBanners banners={banners} />
      <LatestNews items={news} />
      <ActivitiesSection items={activities} />
      <AdvertisementsSection />
    </>
  );
}
