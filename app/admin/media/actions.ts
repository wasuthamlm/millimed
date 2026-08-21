"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { ServiceError } from "@/lib/services/errors";
import * as mediaService from "@/lib/services/media";

type ActionResult = { error?: string };

function revalidateAll() {
  revalidatePath("/admin/media");
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

export async function createFolder(name: string): Promise<ActionResult> {
  await requireAdmin();
  return run(() => mediaService.createFolder(name));
}

export async function renameFolder(id: string, name: string): Promise<ActionResult> {
  await requireAdmin();
  return run(() => mediaService.renameFolder(id, name));
}

export async function deleteFolder(id: string): Promise<ActionResult> {
  await requireAdmin();
  return run(() => mediaService.deleteFolder(id));
}

export async function deleteMedia(id: string): Promise<ActionResult> {
  await requireAdmin();
  return run(() => mediaService.deleteMedia(id));
}

export async function moveMedia(id: string, folderId: string | null): Promise<ActionResult> {
  await requireAdmin();
  return run(() => mediaService.moveMedia(id, folderId));
}
