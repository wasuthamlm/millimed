import { FooterColumn, FooterLink, FooterContact, FooterConfig, sequelize } from "@/lib/db/models/index";
import type { FooterColumn as FooterColumnData } from "@/data/admin-footer";

export type FooterContactInput = {
  phone: string;
  email: string;
  address: string;
  tagline: string;
};

export type FooterThemeInput = {
  bgColor: string;
  textColor: string;
  accentColor: string;
  desktopColumns: number;
  copyrightTh: string;
  copyrightEn: string;
};

export async function saveFooterConfig(
  columns: FooterColumnData[],
  contact: FooterContactInput,
  theme: FooterThemeInput
) {
  await sequelize.transaction(async (t) => {
    await FooterLink.destroy({ where: {}, transaction: t });
    await FooterColumn.destroy({ where: {}, transaction: t });
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      const created = await FooterColumn.create({ title: column.title, order: i }, { transaction: t });
      for (let j = 0; j < column.links.length; j++) {
        const link = column.links[j];
        await FooterLink.create({ columnId: created.id, label: link.label, href: link.href, order: j }, { transaction: t });
      }
    }

    const [contactRow] = await FooterContact.findOrCreate({
      where: { id: "singleton" },
      defaults: { id: "singleton", ...contact },
      transaction: t,
    });
    await contactRow.update(contact, { transaction: t });

    const configData = {
      bgColor: theme.bgColor,
      textColor: theme.textColor,
      accentColor: theme.accentColor,
      desktopColumns: theme.desktopColumns,
      copyrightTh: theme.copyrightTh || null,
      copyrightEn: theme.copyrightEn || null,
    };
    const [configRow] = await FooterConfig.findOrCreate({
      where: { id: "singleton" },
      defaults: { id: "singleton", ...configData },
      transaction: t,
    });
    await configRow.update(configData, { transaction: t });
  });
}
