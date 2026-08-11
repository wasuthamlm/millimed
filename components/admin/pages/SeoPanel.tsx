"use client";

import { useMemo, useState } from "react";
import { SaveButton } from "@/components/admin/SaveButton";
import { SeoScorePanel } from "@/components/admin/seo/SeoScorePanel";
import { calculateSeoAeoGeo, pageToScoreInput } from "@/lib/seo-score";
import { setPageSeo } from "@/app/admin/pages/actions";
import { SITE_URL } from "@/lib/site";
import type { PageSectionRow } from "./types";

export type InitialPageSeo = {
  seoTitle: string;
  seoDesc: string;
  seoTitleEn: string;
  seoDescEn: string;
  seoNoIndex: boolean;
};

export function SeoPanel({
  pageId,
  slug,
  titleTh,
  titleEn,
  sections,
  initialSeo,
}: {
  pageId: string;
  slug: string;
  titleTh: string;
  titleEn: string | null;
  sections: PageSectionRow[];
  initialSeo: InitialPageSeo;
}) {
  const [seoTitle, setSeoTitle] = useState(initialSeo.seoTitle);
  const [seoDesc, setSeoDesc] = useState(initialSeo.seoDesc);
  const [seoTitleEn, setSeoTitleEn] = useState(initialSeo.seoTitleEn);
  const [seoDescEn, setSeoDescEn] = useState(initialSeo.seoDescEn);
  const [seoNoIndex, setSeoNoIndex] = useState(initialSeo.seoNoIndex);

  const result = useMemo(
    () =>
      calculateSeoAeoGeo(
        pageToScoreInput({
          titleTh,
          titleEn,
          seoTitle,
          seoTitleEn,
          seoDesc,
          seoDescEn,
          slug,
          sections: sections.map((s) => ({ titleTh: s.titleTh, imageUrl: s.imageUrl, bodyTh: s.bodyTh })),
        })
      ),
    [titleTh, titleEn, seoTitle, seoTitleEn, seoDesc, seoDescEn, slug, sections]
  );

  const handleSave = async () => {
    const res = await setPageSeo(pageId, { seoTitle, seoDesc, seoTitleEn, seoDescEn, seoNoIndex });
    if (res.error) throw new Error(res.error);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <SeoScorePanel result={result} />

      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-500">Meta Title (TH)</label>
        <input
          type="text"
          value={seoTitle}
          onChange={(e) => setSeoTitle(e.target.value)}
          maxLength={60}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
        />
        <p className="mt-1 text-xs text-slate-400">{seoTitle.length}/60 ตัวอักษร</p>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-500">Meta Description (TH)</label>
        <textarea
          value={seoDesc}
          onChange={(e) => setSeoDesc(e.target.value)}
          maxLength={160}
          rows={4}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
        />
        <p className="mt-1 text-xs text-slate-400">{seoDesc.length}/160 ตัวอักษร</p>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-500">Meta Title (EN)</label>
        <input
          type="text"
          value={seoTitleEn}
          onChange={(e) => setSeoTitleEn(e.target.value)}
          maxLength={60}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-500">Meta Description (EN)</label>
        <textarea
          value={seoDescEn}
          onChange={(e) => setSeoDescEn(e.target.value)}
          maxLength={160}
          rows={4}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
        />
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold text-slate-600">Advanced SEO</p>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={seoNoIndex} onChange={(e) => setSeoNoIndex(e.target.checked)} />
          ซ่อนหน้านี้จาก Google (no_index)
        </label>
        <p className="text-xs text-slate-400">เปิดเมื่อไม่ต้องการให้ Search Engine เก็บหน้านี้เข้าดัชนี</p>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <p className="mb-1 text-xs font-medium text-slate-500">Canonical URL</p>
        <p className="truncate text-sm text-slate-600">{`${SITE_URL}${slug === "home" ? "/" : `/${slug}`}`}</p>
      </div>

      <div className="flex justify-end">
        <SaveButton onSave={handleSave} />
      </div>
    </div>
  );
}
