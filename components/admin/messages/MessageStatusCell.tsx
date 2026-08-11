"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setMessageStatus } from "@/app/admin/messages/actions";
import { StatusSelectPill } from "@/components/admin/StatusSelectPill";

type MessageStatus = "NEW" | "READ" | "ARCHIVED";

const STYLES: Record<MessageStatus, string> = {
  NEW: "bg-sky-50 text-sky-700",
  READ: "bg-slate-100 text-slate-600",
  ARCHIVED: "bg-slate-100 text-slate-400",
};

const OPTIONS = [
  { value: "NEW" as const, label: "ใหม่" },
  { value: "READ" as const, label: "อ่านแล้ว" },
  { value: "ARCHIVED" as const, label: "เก็บถาวร" },
];

export function MessageStatusCell({ id, status }: { id: string; status: MessageStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <StatusSelectPill
      value={status}
      options={OPTIONS}
      colorClass={STYLES[status]}
      disabled={pending}
      ariaLabel="สถานะข้อความ"
      onChange={(next) =>
        startTransition(async () => {
          await setMessageStatus(id, next);
          router.refresh();
        })
      }
    />
  );
}
