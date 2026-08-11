"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserDisabled } from "@/app/admin/users/actions";
import { Toggle } from "@/components/admin/Toggle";

export function UserDisabledToggle({ id, disabled, isSelf }: { id: string; disabled: boolean; isSelf: boolean }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <Toggle
        checked={!disabled}
        label="เปิด/ปิดใช้งานผู้ใช้"
        onChange={(enabled) => {
          if (isSelf) return;
          startTransition(async () => {
            setError(null);
            const result = await setUserDisabled(id, !enabled);
            if (result.error) setError(result.error);
            router.refresh();
          });
        }}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
