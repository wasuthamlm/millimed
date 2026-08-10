"use server";

import { z } from "zod";
import { ContactMessage } from "@/lib/db/models/index";

const contactSchema = z.object({
  name: z.string().trim().min(1, "กรุณากรอกชื่อ-นามสกุล"),
  email: z.string().trim().email("อีเมลไม่ถูกต้อง"),
  phone: z.string().trim().optional(),
  subject: z.string().trim().optional(),
  message: z.string().trim().min(1, "กรุณากรอกข้อความ"),
});

export type ContactActionResult = { error?: string };

export async function submitContactMessage(input: unknown): Promise<ContactActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const data = parsed.data;
  await ContactMessage.create({
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    subject: data.subject || null,
    body: data.message,
    status: "NEW",
  });

  return {};
}
