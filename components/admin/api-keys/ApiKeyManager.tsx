"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createApiKey, revokeApiKey, deleteApiKey } from "@/app/admin/api-keys/actions";
import { KeyIcon, CopyIcon, TrashIcon } from "@/components/ui/admin-icons";

export type ApiKeyRow = {
  id: string;
  label: string;
  keyPrefix: string;
  scopes: string[];
  active: boolean;
  lastUsedAt: string | null;
  createdAt: string;
};

export function ApiKeyManager({ keys }: { keys: ApiKeyRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [label, setLabel] = useState("");
  const [scopes, setScopes] = useState<string[]>(["read"]);
  const [error, setError] = useState<string | null>(null);
  const [newRawKey, setNewRawKey] = useState<string | null>(null);

  function toggleScope(scope: string) {
    setScopes((prev) => (prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]));
  }

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      const result = await createApiKey({ label, scopes: scopes as ("read" | "write")[] });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setNewRawKey(result.rawKey);
      setLabel("");
      setScopes(["read"]);
      router.refresh();
    });
  }

  function handleRevoke(id: string) {
    startTransition(async () => {
      const result = await revokeApiKey(id);
      if (result.error) setError(result.error);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("ลบ API key นี้อย่างถาวรใช่หรือไม่?")) return;
    startTransition(async () => {
      const result = await deleteApiKey(id);
      if (result.error) setError(result.error);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">สร้าง API key ใหม่</h2>
        {newRawKey && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
            <div>
              <p className="font-medium text-amber-800">คัดลอก key นี้ไว้ตอนนี้ — จะไม่แสดงอีกครั้ง</p>
              <code className="mt-1 block break-all font-mono text-amber-900">{newRawKey}</code>
            </div>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(newRawKey)}
              className="flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
            >
              <CopyIcon className="h-3.5 w-3.5" /> คัดลอก
            </button>
          </div>
        )}
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">ชื่อ (ระบบ/หน่วยงานที่ใช้)</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="เช่น External CMS"
              className="w-64 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">สิทธิ์การเข้าถึง</label>
            <div className="flex gap-3 pt-2">
              {["read", "write"].map((scope) => (
                <label key={scope} className="flex items-center gap-1.5 text-sm text-slate-700">
                  <input type="checkbox" checked={scopes.includes(scope)} onChange={() => toggleScope(scope)} />
                  {scope}
                </label>
              ))}
            </div>
          </div>
          <button
            type="button"
            disabled={isPending || !label || scopes.length === 0}
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-dark disabled:opacity-50"
          >
            <KeyIcon className="h-4 w-4" /> สร้าง key
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-6 py-3 font-medium">ชื่อ</th>
              <th className="px-6 py-3 font-medium">Key (prefix)</th>
              <th className="px-6 py-3 font-medium">สิทธิ์</th>
              <th className="px-6 py-3 font-medium">สถานะ</th>
              <th className="px-6 py-3 font-medium">ใช้ล่าสุด</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key.id} className="border-b border-slate-50 last:border-0">
                <td className="px-6 py-3.5 font-medium text-slate-800">{key.label}</td>
                <td className="px-6 py-3.5 font-mono text-xs text-slate-500">{key.keyPrefix}…</td>
                <td className="px-6 py-3.5 text-slate-600">{key.scopes.join(", ")}</td>
                <td className="px-6 py-3.5">
                  {key.active ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      ใช้งานอยู่
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                      ปิดใช้งาน
                    </span>
                  )}
                </td>
                <td className="px-6 py-3.5 text-slate-400">{key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString("th-TH") : "ยังไม่เคยใช้"}</td>
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-2">
                    {key.active && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleRevoke(key.id)}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        ปิดใช้งาน
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDelete(key.id)}
                      className="rounded-lg border border-red-100 p-1.5 text-red-500 hover:bg-red-50"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {keys.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  ยังไม่มี API key
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
