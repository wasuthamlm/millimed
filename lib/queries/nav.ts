import { NavLink as NavLinkModel } from "@/lib/db/models/index";
import type { NavLink } from "@/data/nav";
import { getLatestNews } from "./posts";

const NEWS_DROPDOWN_LIMIT = 8;

export async function getHeaderNavLinks(): Promise<NavLink[]> {
  const [rows, latestNews] = await Promise.all([
    NavLinkModel.findAll({
      where: { placement: "HEADER", active: true },
      order: [["order", "ASC"]],
    }),
    getLatestNews(NEWS_DROPDOWN_LIMIT),
  ]);

  const topLevel = rows.filter((r) => !r.parentId);
  const childrenByParent = new Map<string, NavLinkModel[]>();
  for (const row of rows) {
    if (!row.parentId) continue;
    const list = childrenByParent.get(row.parentId) ?? [];
    list.push(row);
    childrenByParent.set(row.parentId, list);
  }

  return topLevel.map((row) => {
    // "ข่าวสารและกิจกรรม" has no manually-curated submenu — its dropdown mirrors the
    // old site's behavior of always showing the latest news, not a static list that
    // would go stale the moment a new item is published from the admin.
    if (row.href === "/news" && latestNews.length > 0) {
      return {
        label: row.labelTh,
        href: row.href,
        children: [
          ...latestNews.map((n) => ({ label: n.title, href: `/news/${n.slug}` })),
          { label: "ดูข่าวทั้งหมด", href: "/news" },
        ],
      };
    }

    const children = childrenByParent.get(row.id);
    return {
      label: row.labelTh,
      href: row.href,
      ...(children && children.length > 0
        ? { children: children.map((c) => ({ label: c.labelTh, href: c.href })) }
        : {}),
    };
  });
}
