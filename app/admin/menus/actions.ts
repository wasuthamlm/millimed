"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { NavLink, sequelize } from "@/lib/db/models/index";
import { requireAdmin } from "@/lib/require-admin";

const navLinkSchema = z.object({
  labelTh: z.string().min(1, "จำเป็นต้องระบุชื่อเมนู").max(120),
  labelEn: z.string().max(120).optional().or(z.literal("")),
  // Empty href is allowed for a parent item that only hosts a hover dropdown for its
  // children (e.g. "รู้จักเรา") — NavDropdown.tsx renders it non-clickable in that case.
  href: z.string().max(300),
  parentId: z.string().nullable(),
});

type ActionResult = { error?: string };

function revalidateAll() {
  revalidatePath("/admin/menus");
  revalidatePath("/", "layout");
}

export async function createNavLink(input: z.infer<typeof navLinkSchema>): Promise<ActionResult> {
  await requireAdmin();
  const parsed = navLinkSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  const siblingCount = await NavLink.count({ where: { parentId: parsed.data.parentId, placement: "HEADER" } });

  await NavLink.create({
    labelTh: parsed.data.labelTh,
    labelEn: parsed.data.labelEn || null,
    href: parsed.data.href,
    parentId: parsed.data.parentId,
    order: siblingCount,
    placement: "HEADER",
  });

  revalidateAll();
  return {};
}

export async function updateNavLink(id: string, input: z.infer<typeof navLinkSchema>): Promise<ActionResult> {
  await requireAdmin();
  const parsed = navLinkSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  await NavLink.update({ labelTh: parsed.data.labelTh, labelEn: parsed.data.labelEn || null, href: parsed.data.href }, { where: { id } });

  revalidateAll();
  return {};
}

export async function deleteNavLink(id: string): Promise<ActionResult> {
  await requireAdmin();
  await NavLink.destroy({ where: { id } });
  revalidateAll();
  return {};
}

export async function toggleNavLink(id: string, active: boolean): Promise<ActionResult> {
  await requireAdmin();
  await NavLink.update({ active }, { where: { id } });
  revalidateAll();
  return {};
}

export async function reorderNavLinks(ids: string[]): Promise<ActionResult> {
  await requireAdmin();
  await sequelize.transaction(async (t) => {
    await Promise.all(ids.map((id, index) => NavLink.update({ order: index }, { where: { id }, transaction: t })));
  });
  revalidateAll();
  return {};
}
