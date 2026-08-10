import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

// Local-disk substitute for Supabase Storage (no cloud credentials available yet).
// Same signature as a cloud storage module so swapping back in Supabase later is
// a one-file change — nothing that calls uploadToStorage/deleteFromStorage needs to know.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function uploadToStorage(filename: string, buffer: Buffer, _contentType: string) {
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

export async function deleteFromStorage(publicUrl: string) {
  const marker = "/uploads/";
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const filename = publicUrl.slice(idx + marker.length);
  if (!filename) return;

  await unlink(path.join(UPLOAD_DIR, filename)).catch(() => {
    // best-effort delete, matching the reference's storage-error swallowing
  });
}
