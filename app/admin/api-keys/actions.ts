"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { ServiceError } from "@/lib/services/errors";
import * as apiKeyService from "@/lib/services/api-keys";
import type { ApiKeyInput } from "@/lib/services/api-keys";

export type { ApiKeyInput };

function revalidateAll() {
  revalidatePath("/admin/api-keys");
}

export async function createApiKey(input: ApiKeyInput): Promise<{ error: string } | { id: string; rawKey: string }> {
  await requireAdmin();
  try {
    const result = await apiKeyService.createApiKey(input);
    revalidateAll();
    return result;
  } catch (err) {
    if (err instanceof ServiceError) return { error: err.message };
    throw err;
  }
}

export async function revokeApiKey(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  try {
    await apiKeyService.revokeApiKey(id);
    revalidateAll();
    return {};
  } catch (err) {
    if (err instanceof ServiceError) return { error: err.message };
    throw err;
  }
}

export async function deleteApiKey(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  try {
    await apiKeyService.deleteApiKey(id);
    revalidateAll();
    return {};
  } catch (err) {
    if (err instanceof ServiceError) return { error: err.message };
    throw err;
  }
}
