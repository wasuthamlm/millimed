"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { UniqueConstraintError } from "sequelize";
import { revalidatePath } from "next/cache";
import { User } from "@/lib/db/models/index";
import type { Role } from "@/lib/db/models/User";
import { requireAdmin } from "@/lib/require-admin";

const STAFF_ROLES = ["ADMIN", "APPROVER", "CONTRIBUTOR"] as const;

const userSchema = z.object({
  email: z.string().min(1, "จำเป็นต้องระบุอีเมล").email("รูปแบบอีเมลไม่ถูกต้อง"),
  name: z.string().optional().or(z.literal("")),
  role: z.enum(STAFF_ROLES),
  password: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร").optional().or(z.literal("")),
  disabled: z.boolean().optional(),
});

export type UserFormInput = z.infer<typeof userSchema>;
export type StaffRole = UserFormInput["role"];
export type UserActionResult = { error: string } | { error?: undefined; id: string };

function revalidateAll() {
  revalidatePath("/admin/users");
}

async function assertNotLastEnabledAdmin(userId: string) {
  const target = await User.findByPk(userId);
  if (!target || target.role !== "ADMIN" || target.disabled) return null;

  const enabledAdmins = await User.count({ where: { role: "ADMIN", disabled: false } });
  if (enabledAdmins <= 1) return "ไม่สามารถทำรายการนี้ได้ เนื่องจากต้องมีผู้ดูแลระบบ (Admin) ที่เปิดใช้งานอย่างน้อย 1 คน";
  return null;
}

export async function createUser(input: UserFormInput): Promise<UserActionResult> {
  await requireAdmin();

  const parsed = userSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const data = parsed.data;
  if (!data.password) {
    return { error: "จำเป็นต้องระบุรหัสผ่านสำหรับผู้ใช้งานใหม่" };
  }

  try {
    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await User.create({
      email: data.email,
      name: data.name || null,
      role: data.role,
      passwordHash,
      disabled: data.disabled ?? false,
    });

    revalidateAll();
    return { id: user.id };
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      return { error: "อีเมลนี้ถูกใช้แล้ว" };
    }
    throw err;
  }
}

export async function updateUser(id: string, input: UserFormInput): Promise<UserActionResult> {
  const session = await requireAdmin();

  const parsed = userSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const data = parsed.data;

  const existing = await User.findByPk(id);
  if (!existing) return { error: "ไม่พบผู้ใช้งาน" };

  const isSelf = session?.user?.id === id;
  if (isSelf && data.role !== existing.role) {
    return { error: "ไม่สามารถเปลี่ยนบทบาทของตนเองได้" };
  }
  if (isSelf && data.disabled) {
    return { error: "ไม่สามารถปิดใช้งานบัญชีของตนเองได้" };
  }
  if ((data.role !== "ADMIN" || data.disabled) && !isSelf) {
    const blocked = await assertNotLastEnabledAdmin(id);
    if (blocked) return { error: blocked };
  }

  try {
    const passwordHash = data.password ? await bcrypt.hash(data.password, 12) : existing.passwordHash;
    await existing.update({
      email: data.email,
      name: data.name || null,
      role: data.role,
      passwordHash,
      disabled: data.disabled ?? false,
    });

    revalidateAll();
    return { id: existing.id };
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      return { error: "อีเมลนี้ถูกใช้แล้ว" };
    }
    throw err;
  }
}

export async function deleteUser(id: string): Promise<{ error?: string }> {
  const session = await requireAdmin();

  if (session?.user?.id === id) {
    return { error: "ไม่สามารถลบบัญชีของตนเองได้" };
  }

  const existing = await User.findByPk(id);
  if (!existing) return { error: "ไม่พบผู้ใช้งาน" };

  const blocked = await assertNotLastEnabledAdmin(id);
  if (blocked) return { error: blocked };

  await existing.destroy();
  revalidateAll();
  return {};
}

export async function setUserRole(id: string, role: Role): Promise<{ error?: string }> {
  const session = await requireAdmin();

  if (session?.user?.id === id) {
    return { error: "ไม่สามารถเปลี่ยนบทบาทของตนเองได้" };
  }

  const existing = await User.findByPk(id);
  if (!existing) return { error: "ไม่พบผู้ใช้งาน" };

  const blocked = await assertNotLastEnabledAdmin(id);
  if (blocked) return { error: blocked };

  await existing.update({ role });
  revalidateAll();
  return {};
}

export async function setUserDisabled(id: string, disabled: boolean): Promise<{ error?: string }> {
  const session = await requireAdmin();

  if (session?.user?.id === id) {
    return { error: "ไม่สามารถปิดใช้งานบัญชีของตนเองได้" };
  }

  const existing = await User.findByPk(id);
  if (!existing) return { error: "ไม่พบผู้ใช้งาน" };

  if (disabled) {
    const blocked = await assertNotLastEnabledAdmin(id);
    if (blocked) return { error: blocked };
  }

  await existing.update({ disabled });
  revalidateAll();
  return {};
}
