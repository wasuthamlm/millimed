"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SaveButton } from "@/components/admin/SaveButton";
import { createUser, updateUser, type UserFormInput, type StaffRole } from "@/app/admin/users/actions";

export type InitialUser = {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  disabled: boolean;
};

const EMPTY_USER: InitialUser = {
  id: "",
  email: "",
  name: "",
  role: "CONTRIBUTOR",
  disabled: false,
};

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

export function UserForm({ initialUser, isSelf = false }: { initialUser?: InitialUser; isSelf?: boolean }) {
  const router = useRouter();
  const isEdit = Boolean(initialUser?.id);
  const [form, setForm] = useState<InitialUser>(initialUser ?? EMPTY_USER);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof InitialUser>(key: K, value: InitialUser[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setError(null);
    const input: UserFormInput = {
      email: form.email,
      name: form.name,
      role: form.role,
      disabled: form.disabled,
      password: password || undefined,
    };

    const result = isEdit ? await updateUser(initialUser!.id, input) : await createUser(input);
    if (result.error) {
      setError(result.error);
      throw new Error(result.error);
    }

    router.push("/admin/users");
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</div>}

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:grid-cols-2">
        <div>
          <label className={labelClass}>อีเมล</label>
          <input type="email" className={inputClass} value={form.email} onChange={(e) => update("email", e.target.value)} />
        </div>

        <div>
          <label className={labelClass}>ชื่อ</label>
          <input className={inputClass} value={form.name} onChange={(e) => update("name", e.target.value)} />
        </div>

        <div>
          <label className={labelClass}>บทบาท</label>
          <select
            className={inputClass}
            value={form.role}
            disabled={isSelf}
            onChange={(e) => update("role", e.target.value as StaffRole)}
          >
            <option value="ADMIN">Admin</option>
            <option value="APPROVER">Approver</option>
            <option value="CONTRIBUTOR">Contributor</option>
          </select>
          {isSelf && <p className="mt-1 text-xs text-slate-400">ไม่สามารถเปลี่ยนบทบาทของตนเองได้</p>}
        </div>

        <div>
          <label className={labelClass}>{isEdit ? "รหัสผ่านใหม่ (เว้นว่างไว้หากไม่เปลี่ยน)" : "รหัสผ่าน"}</label>
          <input type="password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {isEdit && (
          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 accent-brand-navy"
                checked={form.disabled}
                disabled={isSelf}
                onChange={(e) => update("disabled", e.target.checked)}
              />
              ปิดใช้งานบัญชีนี้
            </label>
          </div>
        )}
      </div>

      <div>
        <SaveButton label={isEdit ? "บันทึกการเปลี่ยนแปลง" : "สร้างผู้ใช้งาน"} onSave={handleSave} />
      </div>
    </div>
  );
}
