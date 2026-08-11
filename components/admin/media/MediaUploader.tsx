"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloudIcon } from "@/components/ui/admin-icons";
import { cn } from "@/lib/utils";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);
const MAX_SIZE = 5 * 1024 * 1024;

export function MediaUploader({ folderId }: { folderId: string | null }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    setError(null);
    const errors: string[] = [];

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!ALLOWED_TYPES.has(file.type)) {
          errors.push(`${file.name}: รองรับเฉพาะไฟล์รูปภาพ`);
          continue;
        }
        if (file.size > MAX_SIZE) {
          errors.push(`${file.name}: ขนาดไฟล์ต้องไม่เกิน 5MB`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);
        if (folderId) formData.append("folderId", folderId);

        const res = await fetch("/api/admin/media", { method: "POST", body: formData });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          errors.push(`${file.name}: ${data?.error ?? "อัปโหลดไม่สำเร็จ"}`);
        }
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
      if (errors.length) setError(errors.join(", "));
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-dark disabled:opacity-60"
        )}
      >
        <UploadCloudIcon className="h-4 w-4" />
        {uploading ? "กำลังอัปโหลด..." : "อัปโหลดรูปภาพ"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void handleFiles(e.target.files);
        }}
      />
      {error && <p className="max-w-xs text-xs text-red-600">{error}</p>}
    </div>
  );
}
