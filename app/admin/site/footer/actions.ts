"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import * as footerService from "@/lib/services/footer";
import type { FooterThemeInput } from "@/lib/services/footer";
import type { FooterColumn as FooterColumnData } from "@/data/admin-footer";

export type { FooterThemeInput };

type FooterContactInput = {
  phone: string;
  email: string;
  address: string;
  tagline: string;
};

export async function saveFooterConfig(columns: FooterColumnData[], contact: FooterContactInput, theme: FooterThemeInput) {
  await requireAdmin();

  await footerService.saveFooterConfig(columns, contact, theme);

  revalidatePath("/admin/site/footer");
  revalidatePath("/", "layout");
}
