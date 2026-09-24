"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NewsCategoryFilter } from "@/lib/queries/posts";

const TABS: { value: NewsCategoryFilter; label: string }[] = [
  { value: "all", label: "ทั้งหมด" },
  { value: "company", label: "ข่าวสารบริษัท" },
  { value: "csr", label: "กิจกรรมเพื่อสังคม" },
  { value: "internal", label: "กิจกรรมภายใน" },
];

export function NewsCategoryTabs({ active }: { active: NewsCategoryFilter }) {
  const searchParams = useSearchParams();

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {TABS.map((tab) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("page");
        if (tab.value === "all") params.delete("category");
        else params.set("category", tab.value);
        const qs = params.toString();
        const href = qs ? `/news?${qs}` : "/news";
        const isActive = tab.value === active;

        return (
          <Link
            key={tab.value}
            href={href}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-brand-navy bg-brand-navy text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-brand-navy/40 hover:text-brand-navy"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
