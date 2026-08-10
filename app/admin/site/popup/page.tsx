import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { Share2Icon } from "@/components/ui/admin-icons";
import { PopupManager } from "@/components/admin/site/PopupManager";
import { PopupConfig, Media } from "@/lib/db/models/index";
import type { PopupConfig as PopupConfigData } from "@/data/admin-popup";

export const metadata: Metadata = { title: "จัดการ Popup" };
export const dynamic = "force-dynamic";

function toDateInputValue(date: Date | null | undefined) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export default async function AdminPopupPage() {
  const row = await PopupConfig.findByPk("singleton", { include: [{ model: Media, as: "image" }] });
  const image = row?.get("image") as Media | null;

  const initialConfig: PopupConfigData = {
    enabled: row?.enabled ?? false,
    titleTh: row?.titleTh ?? "",
    image: image?.url ?? "/images/placeholder-banner-1.png",
    link: row?.link ?? "/",
    frequency: (row?.frequency as PopupConfigData["frequency"]) ?? "once-per-day",
    startDate: toDateInputValue(row?.startDate),
    endDate: toDateInputValue(row?.endDate),
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={Share2Icon} title="จัดการ Popup" subtitle="ตั้งค่า Popup ประชาสัมพันธ์ที่แสดงบนหน้าเว็บสาธารณะ" />
      <PopupManager initialConfig={initialConfig} />
    </div>
  );
}
