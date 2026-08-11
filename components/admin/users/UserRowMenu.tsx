"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PencilIcon, TrashIcon } from "@/components/ui/admin-icons";
import { deleteUser } from "@/app/admin/users/actions";

export function UserRowMenu({ id, isSelf }: { id: string; isSelf: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const remove = () => {
    if (!confirm("ยืนยันการลบผู้ใช้งานนี้?")) return;
    startTransition(async () => {
      setError(null);
      const result = await deleteUser(id);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center justify-end gap-1">
        <Link href={`/admin/users/${id}/edit`} aria-label="แก้ไข" className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-navy">
          <PencilIcon className="h-4 w-4" />
        </Link>
        {!isSelf && (
          <button type="button" disabled={pending} onClick={remove} aria-label="ลบ" className="rounded-md p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-60">
            <TrashIcon className="h-4 w-4" />
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
