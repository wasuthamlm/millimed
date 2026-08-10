import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { ListIconGlyph } from "@/components/ui/admin-icons";
import { FooterManager } from "@/components/admin/site/FooterManager";
import { FooterColumn, FooterLink, FooterContact, FooterConfig } from "@/lib/db/models/index";
import type { FooterColumn as FooterColumnData } from "@/data/admin-footer";
import type { FooterThemeInput } from "./actions";

export const metadata: Metadata = { title: "จัดการ Footer" };
export const dynamic = "force-dynamic";

export default async function AdminFooterPage() {
  const [columnRows, contactRow, config] = await Promise.all([
    FooterColumn.findAll({ order: [["order", "ASC"]] }),
    FooterContact.findByPk("singleton"),
    FooterConfig.findByPk("singleton"),
  ]);

  const linkRows = await FooterLink.findAll({ where: { columnId: columnRows.map((c) => c.id) }, order: [["order", "ASC"]] });
  const linksByColumn = new Map<string, FooterLink[]>();
  for (const link of linkRows) {
    const list = linksByColumn.get(link.columnId) ?? [];
    list.push(link);
    linksByColumn.set(link.columnId, list);
  }

  const initialColumns: FooterColumnData[] = columnRows.map((col) => ({
    id: col.id,
    title: col.title,
    links: (linksByColumn.get(col.id) ?? []).map((l) => ({ id: l.id, label: l.label, href: l.href })),
  }));

  const initialContact = {
    phone: contactRow?.phone ?? "",
    email: contactRow?.email ?? "",
    address: contactRow?.address ?? "",
    tagline: contactRow?.tagline ?? "",
  };

  const initialTheme: FooterThemeInput = {
    bgColor: config?.bgColor ?? "#0d1a4a",
    textColor: config?.textColor ?? "#ffffff",
    accentColor: config?.accentColor ?? "#f5b301",
    desktopColumns: config?.desktopColumns ?? 3,
    copyrightTh: config?.copyrightTh ?? "",
    copyrightEn: config?.copyrightEn ?? "",
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={ListIconGlyph} title="จัดการ Footer" subtitle="แก้ไขข้อมูล บล็อก ข้อมูลติดต่อ และลิงก์ด้านล่างของเว็บไซต์ทุกหน้า" />
      <FooterManager initialColumns={initialColumns} initialContact={initialContact} initialTheme={initialTheme} />
    </div>
  );
}
