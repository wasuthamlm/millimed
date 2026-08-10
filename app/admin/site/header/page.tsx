import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { GlobeIcon, ListIconGlyph } from "@/components/ui/admin-icons";
import { HeaderAppearanceForm } from "@/components/admin/site/HeaderAppearanceForm";
import { NavLink as NavLinkModel, SiteHeaderConfig } from "@/lib/db/models/index";
import type { NavLink } from "@/data/nav";
import type { HeaderConfigInput } from "./actions";

export const metadata: Metadata = { title: "จัดการ Header" };
export const dynamic = "force-dynamic";

export default async function AdminHeaderPage() {
  const [rows, config] = await Promise.all([
    NavLinkModel.findAll({ where: { placement: "HEADER" }, order: [["order", "ASC"]] }),
    SiteHeaderConfig.findByPk("singleton"),
  ]);

  const childrenByParent = new Map<string, NavLinkModel[]>();
  for (const row of rows) {
    if (!row.parentId) continue;
    const list = childrenByParent.get(row.parentId) ?? [];
    list.push(row);
    childrenByParent.set(row.parentId, list);
  }

  const initialLinks: NavLink[] = rows
    .filter((row) => !row.parentId)
    .map((row) => {
      const children = childrenByParent.get(row.id);
      return {
        label: row.labelTh,
        href: row.href,
        ...(children && children.length > 0 ? { children: children.map((c) => ({ label: c.labelTh, href: c.href })) } : {}),
      };
    });

  const initialConfig: HeaderConfigInput = {
    layout: config?.layout ?? "logo-left-menu-center",
    height: config?.height ?? "standard",
    shadow: config?.shadow ?? "none",
    position: config?.position ?? "fixed-top",
    bgColor: config?.bgColor ?? "#ffffff",
    textColor: config?.textColor ?? "#334155",
    hoverBgColor: config?.hoverBgColor ?? "#f1f5f9",
    hoverTextColor: config?.hoverTextColor ?? "#16296b",
    activeBgColor: config?.activeBgColor ?? "#16296b",
    activeTextColor: config?.activeTextColor ?? "#ffffff",
    iconTextColor: config?.iconTextColor ?? "#16296b",
    logoMode: config?.logoMode ?? "site-settings",
    logoTextTh: config?.logoTextTh ?? "",
    logoTextEn: config?.logoTextEn ?? "",
    menuWrap: config?.menuWrap ?? "single-line",
    menuFontSize: config?.menuFontSize ?? "normal",
    menuLevels: config?.menuLevels ?? 2,
    submenuStyle: config?.submenuStyle ?? "hover-open",
    submenuChildBehavior: config?.submenuChildBehavior ?? "below-parent",
    showSearch: config?.showSearch ?? false,
    showLanguage: config?.showLanguage ?? false,
    showAccount: config?.showAccount ?? false,
    showCart: config?.showCart ?? false,
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={GlobeIcon} title="จัดการ Header" subtitle="ปรับค่าด้านซ้าย แล้วดูผลแบบคลิกทดสอบได้ใน Live Preview" />
      <HeaderAppearanceForm initial={initialConfig} navLinks={initialLinks} />

      <Link href="/admin/menus" className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-colors hover:border-brand-navy/30">
        <div className="flex items-center gap-3">
          <ListIconGlyph className="h-5 w-5 text-brand-navy" />
          <div>
            <p className="text-sm font-semibold text-slate-800">แก้ไขรายการเมนู</p>
            <p className="text-xs text-slate-400">เพิ่ม/ลบ/จัดลำดับเมนูแบบหลายระดับได้ที่หน้า Menu Manager</p>
          </div>
        </div>
        <span className="text-sm font-medium text-brand-navy">ไปที่ Menu Manager →</span>
      </Link>
    </div>
  );
}
