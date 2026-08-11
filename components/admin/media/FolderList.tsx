"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { PlusIcon, PencilIcon, TrashIcon, FolderIcon } from "@/components/ui/admin-icons";
import { createFolder, renameFolder, deleteFolder } from "@/app/admin/media/actions";
import { cn } from "@/lib/utils";

export type FolderRow = { id: string; name: string; count: number };

const inputClass =
  "w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-800 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";

export function FolderList({ folders, activeFolderId, totalCount }: { folders: FolderRow[]; activeFolderId: string | null; totalCount: number }) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submitAdd = () => {
    if (!newName.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await createFolder(newName.trim());
      if (res.error) {
        setError(res.error);
        return;
      }
      setNewName("");
      setAdding(false);
    });
  };

  const submitRename = (id: string) => {
    if (!editName.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await renameFolder(id, editName.trim());
      if (res.error) {
        setError(res.error);
        return;
      }
      setEditingId(null);
    });
  };

  const remove = (id: string) => {
    if (!confirm("ลบโฟลเดอร์นี้? ไฟล์ในโฟลเดอร์จะถูกย้ายไปที่ \"ไม่มีโฟลเดอร์\"")) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteFolder(id);
      if (res.error) setError(res.error);
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">โฟลเดอร์</p>
        <button type="button" onClick={() => setAdding((v) => !v)} aria-label="เพิ่มโฟลเดอร์" className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-brand-navy">
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {adding && (
        <div className="flex items-center gap-1.5">
          <input
            autoFocus
            className={inputClass}
            placeholder="ชื่อโฟลเดอร์"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitAdd()}
          />
          <button type="button" disabled={pending} onClick={submitAdd} className="shrink-0 rounded-md bg-brand-navy px-2.5 py-1.5 text-xs font-medium text-white hover:bg-brand-navy-dark disabled:opacity-60">
            บันทึก
          </button>
        </div>
      )}

      <nav className="flex flex-col gap-0.5">
        <Link
          href="/admin/media"
          className={cn(
            "flex items-center justify-between rounded-lg px-2.5 py-2 text-sm",
            activeFolderId === null ? "bg-brand-navy text-white" : "text-slate-600 hover:bg-slate-100"
          )}
        >
          <span className="flex items-center gap-2">
            <FolderIcon className="h-4 w-4" />
            ทั้งหมด
          </span>
          <span className="text-xs opacity-70">{totalCount}</span>
        </Link>

        {folders.map((folder) => {
          const isActive = activeFolderId === folder.id;
          const isEditing = editingId === folder.id;

          if (isEditing) {
            return (
              <div key={folder.id} className="flex items-center gap-1.5 px-1 py-0.5">
                <input
                  autoFocus
                  className={inputClass}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitRename(folder.id)}
                />
                <button type="button" disabled={pending} onClick={() => submitRename(folder.id)} className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-brand-navy hover:bg-slate-100">
                  บันทึก
                </button>
              </div>
            );
          }

          return (
            <div
              key={folder.id}
              className={cn(
                "group flex items-center justify-between rounded-lg px-2.5 py-2 text-sm",
                isActive ? "bg-brand-navy text-white" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Link href={`/admin/media?folder=${folder.id}`} className="flex flex-1 items-center gap-2 truncate">
                <FolderIcon className="h-4 w-4 shrink-0" />
                <span className="truncate">{folder.name}</span>
              </Link>
              <div className="flex items-center gap-1">
                <span className={cn("text-xs", isActive ? "opacity-70" : "text-slate-400")}>{folder.count}</span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(folder.id);
                    setEditName(folder.name);
                  }}
                  aria-label="แก้ไขชื่อโฟลเดอร์"
                  className={cn("rounded p-1 opacity-0 group-hover:opacity-100", isActive ? "hover:bg-white/20" : "hover:bg-slate-200")}
                >
                  <PencilIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(folder.id)}
                  aria-label="ลบโฟลเดอร์"
                  className={cn("rounded p-1 opacity-0 group-hover:opacity-100", isActive ? "hover:bg-white/20" : "hover:bg-red-100 hover:text-red-600")}
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
