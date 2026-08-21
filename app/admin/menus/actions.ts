"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { ServiceError } from "@/lib/services/errors";
import * as navLinkService from "@/lib/services/nav-links";
import type { NavLinkInput } from "@/lib/services/nav-links";

type ActionResult = { error?: string };

function revalidateAll() {
  revalidatePath("/admin/menus");
  revalidatePath("/", "layout");
}

async function run(fn: () => Promise<unknown>): Promise<ActionResult> {
  try {
    await fn();
    revalidateAll();
    return {};
  } catch (err) {
    if (err instanceof ServiceError) return { error: err.message };
    throw err;
  }
}

export async function createNavLink(input: NavLinkInput): Promise<ActionResult> {
  await requireAdmin();
  return run(() => navLinkService.createNavLink(input));
}

export async function updateNavLink(id: string, input: NavLinkInput): Promise<ActionResult> {
  await requireAdmin();
  return run(() => navLinkService.updateNavLink(id, input));
}

export async function deleteNavLink(id: string): Promise<ActionResult> {
  await requireAdmin();
  return run(() => navLinkService.deleteNavLink(id));
}

export async function toggleNavLink(id: string, active: boolean): Promise<ActionResult> {
  await requireAdmin();
  return run(() => navLinkService.toggleNavLink(id, active));
}

export async function reorderNavLinks(ids: string[]): Promise<ActionResult> {
  await requireAdmin();
  return run(() => navLinkService.reorderNavLinks(ids));
}
