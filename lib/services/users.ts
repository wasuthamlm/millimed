import { z } from "zod";
import bcrypt from "bcryptjs";
import { UniqueConstraintError } from "sequelize";
import { User } from "@/lib/db/models/index";
import type { Role } from "@/lib/db/models/User";
import { conflict, forbidden, notFound, validationError } from "@/lib/services/errors";

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

async function assertNotLastEnabledAdmin(userId: string) {
  const target = await User.findByPk(userId);
  if (!target || target.role !== "ADMIN" || target.disabled) return;

  const enabledAdmins = await User.count({ where: { role: "ADMIN", disabled: false } });
  if (enabledAdmins <= 1) {
    throw conflict("ไม่สามารถทำรายการนี้ได้ เนื่องจากต้องมีผู้ดูแลระบบ (Admin) ที่เปิดใช้งานอย่างน้อย 1 คน");
  }
}

function parseInput(input: unknown): UserFormInput {
  const parsed = userSchema.safeParse(input);
  if (!parsed.success) throw validationError(parsed.error);
  return parsed.data;
}

export async function listUsers() {
  return User.findAll({ order: [["createdAt", "DESC"]] });
}

export async function getUser(id: string) {
  const user = await User.findByPk(id);
  if (!user) throw notFound("ไม่พบผู้ใช้งาน");
  return user;
}

export async function createUser(input: unknown) {
  const data = parseInput(input);
  if (!data.password) throw forbidden("จำเป็นต้องระบุรหัสผ่านสำหรับผู้ใช้งานใหม่");

  try {
    const passwordHash = await bcrypt.hash(data.password, 12);
    return await User.create({
      email: data.email,
      name: data.name || null,
      role: data.role,
      passwordHash,
      disabled: data.disabled ?? false,
    });
  } catch (err) {
    if (err instanceof UniqueConstraintError) throw conflict("อีเมลนี้ถูกใช้แล้ว");
    throw err;
  }
}

export async function updateUser(id: string, input: unknown, actorId: string) {
  const data = parseInput(input);
  const existing = await getUser(id);

  const isSelf = actorId === id;
  if (isSelf && data.role !== existing.role) throw forbidden("ไม่สามารถเปลี่ยนบทบาทของตนเองได้");
  if (isSelf && data.disabled) throw forbidden("ไม่สามารถปิดใช้งานบัญชีของตนเองได้");
  if ((data.role !== "ADMIN" || data.disabled) && !isSelf) {
    await assertNotLastEnabledAdmin(id);
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
    return existing;
  } catch (err) {
    if (err instanceof UniqueConstraintError) throw conflict("อีเมลนี้ถูกใช้แล้ว");
    throw err;
  }
}

export async function deleteUser(id: string, actorId: string) {
  if (actorId === id) throw forbidden("ไม่สามารถลบบัญชีของตนเองได้");

  await getUser(id);
  await assertNotLastEnabledAdmin(id);

  await User.destroy({ where: { id } });
}

export async function setUserRole(id: string, role: Role, actorId: string) {
  if (actorId === id) throw forbidden("ไม่สามารถเปลี่ยนบทบาทของตนเองได้");

  await getUser(id);
  await assertNotLastEnabledAdmin(id);

  await User.update({ role }, { where: { id } });
}

export async function setUserDisabled(id: string, disabled: boolean, actorId: string) {
  if (actorId === id) throw forbidden("ไม่สามารถปิดใช้งานบัญชีของตนเองได้");

  await getUser(id);
  if (disabled) await assertNotLastEnabledAdmin(id);

  await User.update({ disabled }, { where: { id } });
}
