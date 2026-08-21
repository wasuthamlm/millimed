import { SiteHeaderConfig } from "@/lib/db/models/index";

export type HeaderConfigInput = {
  layout: string;
  height: string;
  shadow: string;
  position: string;
  bgColor: string;
  textColor: string;
  hoverBgColor: string;
  hoverTextColor: string;
  activeBgColor: string;
  activeTextColor: string;
  iconTextColor: string;
  logoMode: string;
  logoTextTh: string;
  logoTextEn: string;
  menuWrap: string;
  menuFontSize: string;
  menuLevels: number;
  submenuStyle: string;
  submenuChildBehavior: string;
  showSearch: boolean;
  showLanguage: boolean;
  showAccount: boolean;
  showCart: boolean;
};

export async function getHeaderConfig() {
  return SiteHeaderConfig.findByPk("singleton");
}

export async function saveHeaderConfig(input: HeaderConfigInput) {
  const data = { ...input, logoTextTh: input.logoTextTh || null, logoTextEn: input.logoTextEn || null };
  const [row] = await SiteHeaderConfig.findOrCreate({ where: { id: "singleton" }, defaults: { id: "singleton", ...data } });
  await row.update(data);
  return row;
}
