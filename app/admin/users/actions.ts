"use server";

import { revalidatePath } from "next/cache";
import type { Role } from "@/lib/db/models/User";
import { requireAdmin } from "@/lib/require-admin";
import { ServiceError } from "@/lib/services/errors";
import * as userService from "@/lib/services/users";
import type { UserFormInput } from "@/lib/services/users";

export type { UserFormInput, StaffRole } from "@/lib/services/users";
export type UserActionResult = { error: string } | { error?: undefined; id: string };

function revalidateAll() {
  revalidatePath("/admin/users");
}

export async function createUser(input: UserFormInput): Promise<UserActionResult> {
  await requireAdmin();

  try {
    const user = await userService.createUser(input);
    revalidateAll();
    return { id: user.id };
  } catch (err) {
    if (err instanceof ServiceError) return { error: err.message };
    throw err;
  }
}

export async function updateUser(id: string, input: UserFormInput): Promise<UserActionResult> {
  const session = await requireAdmin();

  try {
    const user = await userService.updateUser(id, input, session?.user?.id ?? "");
    revalidateAll();
    return { id: user.id };
  } catch (err) {
    if (err instanceof ServiceError) return { error: err.message };
    throw err;
  }
}

export async function deleteUser(id: string): Promise<{ error?: string }> {
  const session = await requireAdmin();

  try {
    await userService.deleteUser(id, session?.user?.id ?? "");
    revalidateAll();
    return {};
  } catch (err) {
    if (err instanceof ServiceError) return { error: err.message };
    throw err;
  }
}

export async function setUserRole(id: string, role: Role): Promise<{ error?: string }> {
  const session = await requireAdmin();

  try {
    await userService.setUserRole(id, role, session?.user?.id ?? "");
    revalidateAll();
    return {};
  } catch (err) {
    if (err instanceof ServiceError) return { error: err.message };
    throw err;
  }
}

export async function setUserDisabled(id: string, disabled: boolean): Promise<{ error?: string }> {
  const session = await requireAdmin();

  try {
    await userService.setUserDisabled(id, disabled, session?.user?.id ?? "");
    revalidateAll();
    return {};
  } catch (err) {
    if (err instanceof ServiceError) return { error: err.message };
    throw err;
  }
}
