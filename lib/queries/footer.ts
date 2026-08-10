import { FooterColumn, FooterLink, FooterContact, FooterConfig } from "@/lib/db/models/index";

export type FooterColumnData = {
  id: string;
  title: string;
  links: { id: string; label: string; href: string }[];
};

export type FooterContactData = {
  phone: string | null;
  email: string | null;
  address: string | null;
  tagline: string | null;
};

export type FooterConfigData = {
  bgColor: string;
  textColor: string;
  accentColor: string;
  desktopColumns: number;
  copyrightTh: string | null;
};

export async function getFooterData(): Promise<{
  columns: FooterColumnData[];
  contact: FooterContactData | null;
  config: FooterConfigData | null;
}> {
  const [columnRows, contactRow, configRow] = await Promise.all([
    FooterColumn.findAll({ order: [["order", "ASC"]] }),
    FooterContact.findByPk("singleton"),
    FooterConfig.findByPk("singleton"),
  ]);

  const linkRows = await FooterLink.findAll({
    where: { columnId: columnRows.map((c) => c.id) },
    order: [["order", "ASC"]],
  });
  const linksByColumn = new Map<string, FooterLink[]>();
  for (const link of linkRows) {
    const list = linksByColumn.get(link.columnId) ?? [];
    list.push(link);
    linksByColumn.set(link.columnId, list);
  }

  const columns: FooterColumnData[] = columnRows.map((col) => ({
    id: col.id,
    title: col.title,
    links: (linksByColumn.get(col.id) ?? []).map((l) => ({ id: l.id, label: l.label, href: l.href })),
  }));

  const contact: FooterContactData | null = contactRow
    ? { phone: contactRow.phone, email: contactRow.email, address: contactRow.address, tagline: contactRow.tagline }
    : null;

  const config: FooterConfigData | null = configRow
    ? {
        bgColor: configRow.bgColor,
        textColor: configRow.textColor,
        accentColor: configRow.accentColor,
        desktopColumns: configRow.desktopColumns,
        copyrightTh: configRow.copyrightTh,
      }
    : null;

  return { columns, contact, config };
}
