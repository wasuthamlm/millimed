"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { ServiceError } from "@/lib/services/errors";
import * as messageService from "@/lib/services/messages";
import type { MessageStatus } from "@/lib/services/messages";

function revalidateAll() {
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

async function run(fn: () => Promise<unknown>): Promise<{ error?: string }> {
  try {
    await fn();
    revalidateAll();
    return {};
  } catch (err) {
    if (err instanceof ServiceError) return { error: err.message };
    throw err;
  }
}

export async function setMessageStatus(id: string, status: MessageStatus): Promise<{ error?: string }> {
  await requireAdmin();
  return run(() => messageService.setMessageStatus(id, status));
}

export async function markMessageRead(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  return run(() => messageService.markMessageRead(id));
}

export async function deleteMessage(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  return run(() => messageService.deleteMessage(id));
}
