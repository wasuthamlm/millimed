"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserRole, type StaffRole } from "@/app/admin/users/actions";
import { StatusSelectPill } from "@/components/admin/StatusSelectPill";

const STYLES: Record<string, string> = {
  ADMIN: "bg-brand-navy/10 text-brand-navy",
  APPROVER: "bg-emerald-50 text-emerald-700",
  CONTRIBUTOR: "bg-amber-50 text-amber-700",
};

const OPTIONS = [
  { value: "ADMIN" as const, label: "Admin" },
  { value: "APPROVER" as const, label: "Approver" },
  { value: "CONTRIBUTOR" as const, label: "Contributor" },
];

export function UserRoleCell({ id, role, isSelf }: { id: string; role: StaffRole; isSelf: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (isSelf) {
    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[role]}`}>{role}</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      <StatusSelectPill
        value={role}
        options={OPTIONS}
        colorClass={STYLES[role]}
        disabled={pending}
        ariaLabel="บทบาทผู้ใช้งาน"
        onChange={(next) =>
          startTransition(async () => {
            setError(null);
            const result = await setUserRole(id, next);
            if (result.error) setError(result.error);
            router.refresh();
          })
        }
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
