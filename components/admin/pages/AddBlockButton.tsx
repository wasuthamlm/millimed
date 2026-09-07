"use client";

import { PlusIcon } from "@/components/ui/admin-icons";
import type { PageSectionRow } from "./types";

export function AddBlockButton({ onAdd, className }: { onAdd: (section: PageSectionRow) => void; className?: string }) {
  const handleClick = () => {
    onAdd({
      id: crypto.randomUUID(),
      type: "COMPANY_INTRO",
      titleTh: "",
      titleEn: "",
      bodyTh: "",
      anchorId: "",
      imageUrl: "",
      videoUrl: "",
      categoryId: null,
      itemsToShow: null,
      columns: null,
      visibleDesktop: true,
      visibleTablet: true,
      visibleMobile: true,
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ??
        "flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-navy/40 py-4 text-sm font-medium text-brand-navy hover:bg-brand-navy/5"
      }
    >
      <PlusIcon className="h-4 w-4" />
      เพิ่มบล็อกใหม่
    </button>
  );
}
