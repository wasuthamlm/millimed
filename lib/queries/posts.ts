import { Post, Media } from "@/lib/db/models/index";
import type { NewsItem } from "@/data/news";
import type { ArticleItem } from "@/data/articles";

const PLACEHOLDER = "/images/placeholder-news-1.png";

function toNewsItem(row: Post): NewsItem {
  const image = (row.get("coverImage") as Media | null)?.url ?? PLACEHOLDER;
  return {
    slug: row.slug,
    title: row.titleTh,
    image,
    excerpt: row.excerptTh ?? "",
    publishedAt: (row.publishedAt ?? row.createdAt).toISOString(),
    bodyTh: row.bodyTh ?? "",
  };
}

function toArticleItem(row: Post): ArticleItem {
  const image = (row.get("coverImage") as Media | null)?.url ?? PLACEHOLDER;
  return {
    slug: row.slug,
    title: row.titleTh,
    image,
    bodyTh: row.bodyTh ?? "",
  };
}

export async function getLatestNews(limit: number): Promise<NewsItem[]> {
  const rows = await Post.findAll({
    where: { kind: "NEWS", status: "PUBLISHED" },
    order: [["publishedAt", "DESC"]],
    limit,
    include: [{ model: Media, as: "coverImage" }],
  });
  return rows.map(toNewsItem);
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const row = await Post.findOne({
    where: { kind: "NEWS", status: "PUBLISHED", slug },
    include: [{ model: Media, as: "coverImage" }],
  });
  return row ? toNewsItem(row) : null;
}

export async function getLatestArticles(limit: number): Promise<ArticleItem[]> {
  const rows = await Post.findAll({
    where: { kind: "ARTICLE", status: "PUBLISHED" },
    order: [["publishedAt", "DESC"]],
    limit,
    include: [{ model: Media, as: "coverImage" }],
  });
  return rows.map(toArticleItem);
}

export async function getArticleBySlug(slug: string): Promise<ArticleItem | null> {
  const row = await Post.findOne({
    where: { kind: "ARTICLE", status: "PUBLISHED", slug },
    include: [{ model: Media, as: "coverImage" }],
  });
  return row ? toArticleItem(row) : null;
}
