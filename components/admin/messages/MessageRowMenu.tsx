"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@/components/ui/admin-icons";
import { deleteMessage } from "@/app/admin/messages/actions";

export function MessageRowMenu({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const remove = () => {
    if (!confirm("ยืนยันการลบข้อความนี้?")) return;
    startTransition(async () => {
      await deleteMessage(id);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <button type="button" disabled={pending} onClick={remove} aria-label="ลบ" className="rounded-md p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-60">
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
