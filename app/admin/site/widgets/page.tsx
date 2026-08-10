import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsIcon } from "@/components/ui/admin-icons";
import { WidgetsManager } from "@/components/admin/site/WidgetsManager";
import { Widget } from "@/lib/db/models/index";
import type { Widget as WidgetData } from "@/data/admin-widgets";

export const metadata: Metadata = { title: "จัดการ Widgets" };
export const dynamic = "force-dynamic";

export default async function AdminWidgetsPage() {
  const rows = await Widget.findAll({ order: [["name", "ASC"]] });

  const initialWidgets: WidgetData[] = rows.map((row) => ({
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description ?? "",
    enabled: row.enabled,
    link: row.link ?? "",
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={SettingsIcon} title="จัดการ Widgets" subtitle="เปิด/ปิดวิดเจ็ตเสริมที่แสดงบนหน้าเว็บสาธารณะ" />
      <WidgetsManager initialWidgets={initialWidgets} />
    </div>
  );
}
