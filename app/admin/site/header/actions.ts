"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import * as headerConfigService from "@/lib/services/header-config";
import type { HeaderConfigInput } from "@/lib/services/header-config";

export type { HeaderConfigInput };

export async function saveHeaderConfig(input: HeaderConfigInput) {
  await requireAdmin();
  await headerConfigService.saveHeaderConfig(input);
  revalidatePath("/admin/site/header");
  revalidatePath("/", "layout");
}
