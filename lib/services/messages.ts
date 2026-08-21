import { Op } from "sequelize";
import { ContactMessage } from "@/lib/db/models/index";
import { notFound } from "@/lib/services/errors";

export type MessageStatus = "NEW" | "READ" | "ARCHIVED";

export interface ListOptions {
  page?: number;
  limit?: number;
  updatedSince?: Date;
}

export async function listMessages(options: ListOptions = {}) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const where = options.updatedSince ? { updatedAt: { [Op.gte]: options.updatedSince } } : undefined;

  const { rows, count } = await ContactMessage.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit,
    offset: (page - 1) * limit,
  });

  return { items: rows, total: count, page, limit };
}

export async function getMessage(id: string) {
  const message = await ContactMessage.findByPk(id);
  if (!message) throw notFound("ไม่พบข้อความ");
  return message;
}

export async function setMessageStatus(id: string, status: MessageStatus) {
  const existing = await getMessage(id);
  await existing.update({ status });
  return existing;
}

export async function markMessageRead(id: string) {
  const existing = await getMessage(id);
  if (existing.status !== "NEW") return existing;
  await existing.update({ status: "READ" });
  return existing;
}

export async function deleteMessage(id: string) {
  const existing = await getMessage(id);
  await existing.destroy();
}
