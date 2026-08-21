"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import * as bannerService from "@/lib/services/banners";
import type { BannerConfigInput } from "@/lib/services/banners";
import type { Banner as BannerData } from "@/data/admin-banners";

export type { BannerConfigInput };

export async function saveBannerConfig(input: BannerConfigInput) {
  await requireAdmin();
  await bannerService.saveBannerConfig(input);
  revalidatePath("/admin/site/banners");
  revalidatePath("/", "layout");
}

export async function saveBanners(banners: BannerData[]) {
  await requireAdmin();
  await bannerService.saveBanners(banners);
  revalidatePath("/admin/site/banners");
  revalidatePath("/", "layout");
}
