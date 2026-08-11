"use server";

import { revalidatePath } from "next/cache";
import { ContactMessage } from "@/lib/db/models/index";
import { requireAdmin } from "@/lib/require-admin";

type MessageStatus = "NEW" | "READ" | "ARCHIVED";

function revalidateAll() {
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

export async function setMessageStatus(id: string, status: MessageStatus): Promise<{ error?: string }> {
  await requireAdmin();

  const existing = await ContactMessage.findByPk(id);
  if (!existing) return { error: "ไม่พบข้อความ" };

  await existing.update({ status });
  revalidateAll();
  return {};
}

export async function markMessageRead(id: string): Promise<{ error?: string }> {
  await requireAdmin();

  const existing = await ContactMessage.findByPk(id);
  if (!existing) return { error: "ไม่พบข้อความ" };
  if (existing.status !== "NEW") return {};

  await existing.update({ status: "READ" });
  revalidateAll();
  return {};
}

export async function deleteMessage(id: string): Promise<{ error?: string }> {
  await requireAdmin();

  const existing = await ContactMessage.findByPk(id);
  if (!existing) return { error: "ไม่พบข้อความ" };

  await existing.destroy();
  revalidateAll();
  return {};
}
