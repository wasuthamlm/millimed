"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { SearchIcon } from "@/components/ui/admin-icons";

export function UserFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
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
      <div className="relative flex-1">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="ค้นหาชื่อหรืออีเมล..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") setParam("q", q);
          }}
          onBlur={() => setParam("q", q)}
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
        />
      </div>
      <select
        defaultValue={searchParams.get("role") ?? ""}
        onChange={(e) => setParam("role", e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
      >
        <option value="">ทุกบทบาท</option>
        <option value="ADMIN">Admin</option>
        <option value="APPROVER">Approver</option>
        <option value="CONTRIBUTOR">Contributor</option>
      </select>
    </div>
  );
}
