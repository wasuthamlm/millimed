import { NavLink as NavLinkModel } from "@/lib/db/models/index";
import type { NavLink } from "@/data/nav";

export async function getHeaderNavLinks(): Promise<NavLink[]> {
  const rows = await NavLinkModel.findAll({
    where: { placement: "HEADER", active: true },
    order: [["order", "ASC"]],
  });

  const topLevel = rows.filter((r) => !r.parentId);
  const childrenByParent = new Map<string, NavLinkModel[]>();
  for (const row of rows) {
    if (!row.parentId) continue;
    const list = childrenByParent.get(row.parentId) ?? [];
    list.push(row);
    childrenByParent.set(row.parentId, list);
  }

  return topLevel.map((row) => {
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
