export type NewsItem = {
  slug: string;
  title: string;
  image: string;
  gallery: string[];
  excerpt: string;
  publishedAt: string;
  bodyTh: string;
  categoryId: string | null;
  categoryLabel: string | null;
};
