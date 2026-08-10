import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { getLatestArticles } from "@/lib/queries/posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "บทความ",
  alternates: { canonical: "/articles" },
};

export default async function ArticlesPage() {
  const articleItems = await getLatestArticles(100);

  return (
    <Container className="flex flex-col gap-8 py-14 sm:py-20">
      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">บทความ</h1>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {articleItems.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </Container>
  );
}
