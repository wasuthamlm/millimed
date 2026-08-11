"use client";

import { DatabaseIcon, CheckIcon } from "@/components/ui/admin-icons";
import { SaveButton } from "@/components/admin/SaveButton";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { PageSectionRow, SectionType } from "./types";

const SOURCE_LABELS: Record<SectionType, string> = {
  HERO_BANNERS: "แบนเนอร์หน้าแรก",
  CTA_BAR: "ปิดใช้งานถาวร (legacy)",
  COMPANY_INTRO: "เขียนเนื้อหาเอง",
  CUSTOM: "เขียนเนื้อหาเอง",
  LATEST_NEWS: "ข่าวสาร",
  ARTICLES: "บทความ",
};

export function SectionSettingsPanel({
  section,
  onChange,
  onSave,
  articleCount,
  newsCount,
}: {
  section: PageSectionRow;
  onChange: (patch: Partial<PageSectionRow>) => void;
  onSave: () => Promise<void>;
  articleCount: number;
  newsCount: number;
}) {
  const isTextBlock = section.type === "COMPANY_INTRO" || section.type === "CUSTOM";
  const hasDataBinding = section.type === "ARTICLES" || section.type === "LATEST_NEWS";
  const matched = section.type === "ARTICLES" ? articleCount : section.type === "LATEST_NEWS" ? newsCount : 0;

  return (
    <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-5">
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <p className="text-sm font-semibold text-slate-800">การแสดงผลตามอุปกรณ์</p>
          <p className="text-xs text-slate-400">เลือกว่าจะให้ section นี้แสดงบนหน้าจอแบบไหน</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={section.visibleDesktop}
              onChange={() => onChange({ visibleDesktop: !section.visibleDesktop })}
              className="h-4 w-4 shrink-0 rounded border-slate-300 text-brand-navy focus:ring-brand-navy"
            />
            Desktop
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={section.visibleTablet}
              onChange={() => onChange({ visibleTablet: !section.visibleTablet })}
              className="h-4 w-4 shrink-0 rounded border-slate-300 text-brand-navy focus:ring-brand-navy"
            />
            Tablet
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={section.visibleMobile}
              onChange={() => onChange({ visibleMobile: !section.visibleMobile })}
              className="h-4 w-4 shrink-0 rounded border-slate-300 text-brand-navy focus:ring-brand-navy"
            />
            Mobile
          </label>
        </div>
        <SaveButton label="บันทึกการแสดงผล" onSave={onSave} className="w-full justify-center" />
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <p className="text-base font-semibold text-slate-800">{section.titleTh}</p>
          {hasDataBinding && <p className="text-xs text-slate-400">ดึงข้อมูลจาก {SOURCE_LABELS[section.type]} มาแสดงอัตโนมัติ</p>}
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-brand-navy/30 bg-brand-navy/5 px-4 py-2.5 text-sm font-medium text-brand-navy">
          <DatabaseIcon className="h-4 w-4" />
          แหล่งข้อมูล: {SOURCE_LABELS[section.type]}
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              {isTextBlock ? "ชื่อบล็อก (ใช้ในหลังบ้าน)" : "หัวข้อ Section (TH)"}
            </label>
            <input
              type="text"
              value={section.titleTh}
              onChange={(e) => onChange({ titleTh: e.target.value })}
              placeholder={isTextBlock ? "พิมพ์หัวข้อที่นี่..." : undefined}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">หัวข้อ Section (EN)</label>
            <input
              type="text"
              value={section.titleEn}
              onChange={(e) => onChange({ titleEn: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
            />
          </div>
        </div>

        {isTextBlock && (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Anchor ID (ลิงก์กระโดด)</label>
              <input
                type="text"
                value={section.anchorId}
                onChange={(e) => onChange({ anchorId: e.target.value })}
                placeholder="เช่น about-us"
                className="w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">เนื้อหา (TH)</label>
              <RichTextEditor value={section.bodyTh} onChange={(html) => onChange({ bodyTh: html })} placeholder="พิมพ์เนื้อหาที่นี่..." />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">URL รูปภาพ</label>
              <input
                type="text"
                value={section.imageUrl}
                onChange={(e) => onChange({ imageUrl: e.target.value })}
                placeholder="วาง URL รูปภาพ (อัปโหลดได้ที่คลังสื่อ)"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
              />
            </div>
          </>
        )}

        {hasDataBinding && (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">เงื่อนไขการดึงข้อมูล</label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
                defaultValue={section.type === "ARTICLES" ? "articles" : "news"}
              >
                <option value="articles">บทความ</option>
                <option value="news">ข่าวสาร</option>
              </select>
            </div>
            <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <CheckIcon className="h-4 w-4" />
              พบ {matched} รายการตรงเงื่อนไข
            </p>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">จำนวนรายการที่แสดง</label>
                <input
                  type="number"
                  min={1}
                  max={matched || undefined}
                  value={section.itemsToShow ?? matched}
                  onChange={(e) => onChange({ itemsToShow: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
                />
              </div>
              {section.type === "ARTICLES" && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">คอลัมน์ต่อแถว</label>
                  <select
                    value={section.columns ?? 4}
                    onChange={(e) => onChange({ columns: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n} คอลัมน์
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <p className="text-sm font-medium text-slate-600">
              ตัวอย่างรายการที่จะแสดงจริง ({section.itemsToShow ?? matched} รายการ)
            </p>
          </>
        )}

        <div className="flex justify-end">
          <SaveButton onSave={onSave} />
        </div>
      </div>
    </div>
  );
}
