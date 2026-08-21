import { z } from "zod";
import { Op, UniqueConstraintError } from "sequelize";
import { Media, MediaFolder } from "@/lib/db/models/index";
import { deleteFromStorage } from "@/lib/media/cloudinary-storage";
import { conflict, notFound, validationError } from "@/lib/services/errors";

const folderNameSchema = z.string().min(1, "กรุณาระบุชื่อโฟลเดอร์").max(120);

export interface ListMediaOptions {
  page?: number;
  limit?: number;
  updatedSince?: Date;
  folderId?: string | null;
}

export async function listMedia(options: ListMediaOptions = {}) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const where: Record<string, unknown> = {};
  if (options.updatedSince) where.updatedAt = { [Op.gte]: options.updatedSince };
  if (options.folderId !== undefined) where.folderId = options.folderId;

  const { rows, count } = await Media.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit,
    offset: (page - 1) * limit,
  });

  return { items: rows, total: count, page, limit };
}

export async function getMedia(id: string) {
  const media = await Media.findByPk(id);
  if (!media) throw notFound("ไม่พบไฟล์");
  return media;
}

export async function deleteMedia(id: string) {
  const existing = await getMedia(id);
  await deleteFromStorage(existing.url);
  await existing.destroy();
}

export async function moveMedia(id: string, folderId: string | null) {
  const existing = await getMedia(id);
  await existing.update({ folderId: folderId || null });
  return existing;
}

export async function listFolders() {
  return MediaFolder.findAll({ order: [["name", "ASC"]] });
}

async function withUniqueNameGuard<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof UniqueConstraintError) throw conflict("มีโฟลเดอร์ชื่อนี้อยู่แล้ว");
    throw err;
  }
}

export async function createFolder(name: unknown) {
  const parsed = folderNameSchema.safeParse(name);
  if (!parsed.success) throw validationError(parsed.error);
  return withUniqueNameGuard(() => MediaFolder.create({ name: parsed.data }));
}

export async function renameFolder(id: string, name: unknown) {
  const parsed = folderNameSchema.safeParse(name);
  if (!parsed.success) throw validationError(parsed.error);

  const existing = await MediaFolder.findByPk(id);
  if (!existing) throw notFound("ไม่พบโฟลเดอร์");

  return withUniqueNameGuard(async () => {
    await existing.update({ name: parsed.data });
    return existing;
  });
}

export async function deleteFolder(id: string) {
  const existing = await MediaFolder.findByPk(id);
  if (!existing) throw notFound("ไม่พบโฟลเดอร์");

  await Media.update({ folderId: null }, { where: { folderId: id } });
  await existing.destroy();
}
