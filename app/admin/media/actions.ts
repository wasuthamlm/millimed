"use server";

import { z } from "zod";
import { UniqueConstraintError } from "sequelize";
import { revalidatePath } from "next/cache";
import { Media, MediaFolder } from "@/lib/db/models/index";
import { requireAdmin } from "@/lib/require-admin";
import { deleteFromStorage } from "@/lib/media/local-storage";

type ActionResult = { error?: string };

function revalidateAll() {
  revalidatePath("/admin/media");
}

const folderNameSchema = z.string().min(1, "กรุณาระบุชื่อโฟลเดอร์").max(120);

export async function createFolder(name: string): Promise<ActionResult> {
  await requireAdmin();

  const parsed = folderNameSchema.safeParse(name);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  try {
    await MediaFolder.create({ name: parsed.data });
    revalidateAll();
    return {};
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      return { error: "มีโฟลเดอร์ชื่อนี้อยู่แล้ว" };
    }
    throw err;
  }
}

export async function renameFolder(id: string, name: string): Promise<ActionResult> {
  await requireAdmin();

  const parsed = folderNameSchema.safeParse(name);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  const existing = await MediaFolder.findByPk(id);
  if (!existing) return { error: "ไม่พบโฟลเดอร์" };

  try {
    await existing.update({ name: parsed.data });
    revalidateAll();
    return {};
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      return { error: "มีโฟลเดอร์ชื่อนี้อยู่แล้ว" };
    }
    throw err;
  }
}

export async function deleteFolder(id: string): Promise<ActionResult> {
  await requireAdmin();

  const existing = await MediaFolder.findByPk(id);
  if (!existing) return { error: "ไม่พบโฟลเดอร์" };

  await Media.update({ folderId: null }, { where: { folderId: id } });
  await existing.destroy();
  revalidateAll();
  return {};
}

export async function deleteMedia(id: string): Promise<ActionResult> {
  await requireAdmin();

  const existing = await Media.findByPk(id);
  if (!existing) return { error: "ไม่พบไฟล์" };

  await deleteFromStorage(existing.url);
  await existing.destroy();
  revalidateAll();
  return {};
}

export async function moveMedia(id: string, folderId: string | null): Promise<ActionResult> {
  await requireAdmin();

  const existing = await Media.findByPk(id);
  if (!existing) return { error: "ไม่พบไฟล์" };

  await existing.update({ folderId: folderId || null });
  revalidateAll();
  return {};
}
