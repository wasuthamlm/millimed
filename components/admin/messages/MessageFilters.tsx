"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function MessageFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <select
        defaultValue={searchParams.get("status") ?? ""}
        onChange={(e) => setParam("status", e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
      >
        <option value="">ทุกสถานะ</option>
        <option value="NEW">ใหม่</option>
        <option value="READ">อ่านแล้ว</option>
        <option value="ARCHIVED">เก็บถาวร</option>
      </select>
    </div>
  );
}
