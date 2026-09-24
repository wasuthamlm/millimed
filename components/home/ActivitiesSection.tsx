import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NewsGrid } from "@/components/news/NewsGrid";
import type { NewsItem } from "@/data/news";

export function ActivitiesSection({ items }: { items: NewsItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="bg-slate-50 py-14 sm:py-20">
      <Container className="flex flex-col gap-10">
        <SectionHeading title="กิจกรรมเพื่อสังคมและกิจกรรมภายใน" viewAllHref="/news" centered />
        <NewsGrid items={items} />
      </Container>
    </section>
  );
}
