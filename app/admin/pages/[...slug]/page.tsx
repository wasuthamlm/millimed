import { notFound } from "next/navigation";
import { fn, col } from "sequelize";
import { PageEditor } from "@/components/admin/pages/PageEditor";
import { Page, PageSection, NavLink, Post, ArticleCategory } from "@/lib/db/models/index";
import { getLatestArticles, getLatestNews } from "@/lib/queries/posts";
import { getActiveBanners } from "@/lib/queries/banners";
import { getHeaderNavLinks } from "@/lib/queries/nav";
import { getFooterData } from "@/lib/queries/footer";
import { getSiteSocial } from "@/lib/queries/site-settings";
import { calculateSeoAeoGeo, pageToScoreInput } from "@/lib/seo-score";

export const dynamic = "force-dynamic";

export default async function EditPagePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: slugParts } = await params;
  const slug = slugParts.join("/");

  const page = await Page.findOne({ where: { slug } });
  if (!page) notFound();

  const [sections, previewArticles, previewNews, previewBanners, navLinks, footerData, social, navLinkCount, articleCount, newsCount, categories, categoryCounts] =
    await Promise.all([
      PageSection.findAll({ where: { pageId: page.id }, order: [["order", "ASC"]] }),
      getLatestArticles(100),
      getLatestNews(6),
      getActiveBanners(),
      getHeaderNavLinks(),
      getFooterData(),
      getSiteSocial(),
      NavLink.count({ where: { href: slug === "home" ? "/" : `/${slug}` } }),
      Post.count({ where: { kind: "ARTICLE", status: "PUBLISHED" } }),
      Post.count({ where: { kind: "NEWS", status: "PUBLISHED" } }),
      ArticleCategory.findAll({ order: [["order", "ASC"], ["nameTh", "ASC"]] }),
      Post.findAll({
        where: { kind: "ARTICLE", status: "PUBLISHED" },
        attributes: ["categoryId", [fn("COUNT", col("id")), "count"]],
        group: ["categoryId"],
        raw: true,
      }) as unknown as Promise<{ categoryId: string | null; count: string }[]>,
    ]);

  const countByCategory = new Map(categoryCounts.map((c) => [c.categoryId, Number(c.count)]));
  const articleCategories = categories.map((c) => ({ id: c.id, nameTh: c.nameTh, count: countByCategory.get(c.id) ?? 0 }));

  const initialSections = sections.map((s) => {
    const config = (s.config ?? {}) as { anchorId?: string; imageUrl?: string; videoUrl?: string; categoryId?: string };
    return {
      id: s.id,
      type: s.type,
      titleTh: s.titleTh ?? "",
      titleEn: s.titleEn ?? "",
      bodyTh: s.bodyTh ?? "",
      anchorId: config.anchorId ?? "",
      imageUrl: config.imageUrl ?? "",
      videoUrl: config.videoUrl ?? "",
      categoryId: config.categoryId ?? null,
      itemsToShow: s.itemsToShow,
      columns: s.columns,
      visibleDesktop: s.visibleDesktop,
      visibleTablet: s.visibleTablet,
      visibleMobile: s.visibleMobile,
    };
  });

  const seoScore = calculateSeoAeoGeo(
    pageToScoreInput({
      titleTh: page.titleTh,
      titleEn: page.titleEn,
      seoTitle: page.seoTitleTh,
      seoTitleEn: page.seoTitleEn,
      seoDesc: page.seoDescTh,
      seoDescEn: page.seoDescEn,
      slug: page.slug,
      sections: initialSections.map((s) => ({ titleTh: s.titleTh, imageUrl: s.imageUrl, bodyTh: s.bodyTh })),
    })
  ).seo.score;

  return (
    <PageEditor
      pageId={page.id}
      slug={page.slug}
      titleTh={page.titleTh}
      titleEn={page.titleEn}
      status={page.status}
      initialSections={initialSections}
      seoScore={seoScore}
      seo={{
        seoTitle: page.seoTitleTh ?? "",
        seoDesc: page.seoDescTh ?? "",
        seoTitleEn: page.seoTitleEn ?? "",
        seoDescEn: page.seoDescEn ?? "",
        seoNoIndex: page.seoNoIndex,
      }}
      navLinkCount={navLinkCount}
      articleCount={articleCount}
      newsCount={newsCount}
      articleCategories={articleCategories}
      previewArticles={previewArticles}
      previewNews={previewNews}
      previewBanners={previewBanners}
      navLinks={navLinks}
      footerColumns={footerData.columns}
      footerContact={footerData.contact}
      footerConfig={footerData.config}
      social={social}
    />
  );
}
