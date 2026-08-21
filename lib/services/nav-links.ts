import { z } from "zod";
import { Op } from "sequelize";
import { NavLink, sequelize } from "@/lib/db/models/index";
import { notFound, validationError } from "@/lib/services/errors";

export const navLinkSchema = z.object({
  labelTh: z.string().min(1, "จำเป็นต้องระบุชื่อเมนู").max(120),
  labelEn: z.string().max(120).optional().or(z.literal("")),
  href: z.string().max(300),
  parentId: z.string().nullable(),
});

export type NavLinkInput = z.infer<typeof navLinkSchema>;

export interface ListOptions {
  page?: number;
  limit?: number;
  updatedSince?: Date;
}

export async function listNavLinks(options: ListOptions = {}) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 50;
  const where = options.updatedSince ? { updatedAt: { [Op.gte]: options.updatedSince } } : undefined;

  const { rows, count } = await NavLink.findAndCountAll({
    where,
    order: [["order", "ASC"]],
    limit,
    offset: (page - 1) * limit,
  });

  return { items: rows, total: count, page, limit };
}

export async function getNavLink(id: string) {
  const link = await NavLink.findByPk(id);
  if (!link) throw notFound("ไม่พบเมนู");
  return link;
}

function parseInput(input: unknown): NavLinkInput {
  const parsed = navLinkSchema.safeParse(input);
  if (!parsed.success) throw validationError(parsed.error);
  return parsed.data;
}

export async function createNavLink(input: unknown) {
  const data = parseInput(input);
  const siblingCount = await NavLink.count({ where: { parentId: data.parentId, placement: "HEADER" } });

  return NavLink.create({
    labelTh: data.labelTh,
    labelEn: data.labelEn || null,
    href: data.href,
    parentId: data.parentId,
    order: siblingCount,
    placement: "HEADER",
  });
}

export async function updateNavLink(id: string, input: unknown) {
  const data = parseInput(input);
  await getNavLink(id);
  await NavLink.update({ labelTh: data.labelTh, labelEn: data.labelEn || null, href: data.href }, { where: { id } });
  return getNavLink(id);
}

export async function deleteNavLink(id: string) {
  await getNavLink(id);
  await NavLink.destroy({ where: { id } });
}

export async function toggleNavLink(id: string, active: boolean) {
  await getNavLink(id);
  await NavLink.update({ active }, { where: { id } });
}

export async function reorderNavLinks(ids: string[]) {
  await sequelize.transaction(async (t) => {
    await Promise.all(ids.map((id, index) => NavLink.update({ order: index }, { where: { id }, transaction: t })));
  });
}
