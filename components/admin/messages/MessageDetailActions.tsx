"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@/components/ui/admin-icons";
import { deleteMessage } from "@/app/admin/messages/actions";
import { MessageStatusCell } from "@/components/admin/messages/MessageStatusCell";

type MessageStatus = "NEW" | "READ" | "ARCHIVED";

export function MessageDetailActions({ id, status }: { id: string; status: MessageStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const remove = () => {
    if (!confirm("ยืนยันการลบข้อความนี้?")) return;
    startTransition(async () => {
      await deleteMessage(id);
      router.push("/admin/messages");
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-3">
      <MessageStatusCell id={id} status={status} />
      <button
        type="button"
        disabled={pending}
        onClick={remove}
        className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
      >
        <TrashIcon className="h-4 w-4" />
        ลบข้อความ
      </button>
    </div>
  );
}
