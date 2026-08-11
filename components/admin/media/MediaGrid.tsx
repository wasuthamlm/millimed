"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@/components/ui/admin-icons";
import { deleteMedia, moveMedia } from "@/app/admin/media/actions";

export type MediaItem = { id: string; url: string; filename: string; folderId: string | null };
export type FolderOption = { id: string; name: string };

export function MediaGrid({ items, folders }: { items: MediaItem[]; folders: FolderOption[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const remove = (id: string) => {
    if (!confirm("ยืนยันการลบไฟล์นี้?")) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteMedia(id);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  };

  const move = (id: string, folderId: string) => {
    setError(null);
    startTransition(async () => {
      const res = await moveMedia(id, folderId || null);
      if (res.error) setError(res.error);
      router.refresh();
    });
  };

  if (items.length === 0) {
    return <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center text-sm text-slate-400">ไม่พบไฟล์ในโฟลเดอร์นี้</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((item) => (
          <div key={item.id} className="group flex flex-col gap-2 rounded-xl border border-slate-100 bg-white p-2 shadow-sm">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-50">
              <Image src={item.url} alt={item.filename} fill unoptimized className="object-cover" />
              <button
                type="button"
                disabled={pending}
                onClick={() => remove(item.id)}
                aria-label="ลบไฟล์"
                className="absolute right-1.5 top-1.5 rounded-md bg-white/90 p-1.5 text-red-500 opacity-0 shadow transition-opacity hover:bg-red-50 group-hover:opacity-100 disabled:opacity-60"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
            <p className="truncate text-xs text-slate-500" title={item.filename}>
              {item.filename}
            </p>
            <select
              value={item.folderId ?? ""}
              disabled={pending}
              onChange={(e) => move(item.id, e.target.value)}
              className="w-full rounded-md border border-slate-200 px-1.5 py-1 text-xs text-slate-600 focus:border-brand-navy focus:outline-none"
            >
              <option value="">— ไม่มีโฟลเดอร์ —</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
