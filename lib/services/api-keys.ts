import { z } from "zod";
import crypto from "crypto";
import { ApiKey } from "@/lib/db/models/index";
import type { ApiKeyScope } from "@/lib/db/models/ApiKey";
import { notFound, validationError } from "@/lib/services/errors";

const scopesSchema = z.array(z.enum(["read", "write"])).min(1);

const apiKeySchema = z.object({
  label: z.string().min(1, "จำเป็นต้องระบุชื่อ").max(120),
  scopes: scopesSchema.default(["read"]),
});

export type ApiKeyInput = z.infer<typeof apiKeySchema>;

function hashKey(rawKey: string): string {
  const secret = process.env.API_KEY_HASH_SECRET;
  if (!secret) {
    // Fail loudly rather than silently hashing with "" — if this were allowed,
    // setting the secret later would invalidate every previously issued key
    // without any error at issue-time.
    throw new Error("API_KEY_HASH_SECRET is not set");
  }
  return crypto.createHmac("sha256", secret).update(rawKey).digest("hex");
}

function generateRawKey(): string {
  return `mlm_${crypto.randomBytes(24).toString("hex")}`;
}

export async function listApiKeys() {
  return ApiKey.findAll({
    order: [["createdAt", "DESC"]],
    attributes: { exclude: ["keyHash"] },
  });
}

export async function createApiKey(input: unknown) {
  const parsed = apiKeySchema.safeParse(input);
  if (!parsed.success) throw validationError(parsed.error);

  const rawKey = generateRawKey();
  const record = await ApiKey.create({
    label: parsed.data.label,
    keyHash: hashKey(rawKey),
    keyPrefix: rawKey.slice(0, 12),
    scopes: parsed.data.scopes as ApiKeyScope[],
  });

  // Raw key is only ever available here, at creation time — not persisted.
  return { id: record.id, rawKey };
}

export async function revokeApiKey(id: string) {
  const key = await ApiKey.findByPk(id);
  if (!key) throw notFound("ไม่พบ API key");
  await key.update({ active: false });
}

export async function deleteApiKey(id: string) {
  const key = await ApiKey.findByPk(id);
  if (!key) throw notFound("ไม่พบ API key");
  await key.destroy();
}

/**
 * Validates a raw x-api-key header value and, if valid+active+scoped,
 * returns the ApiKey record. Used by lib/api/authenticate.ts. Kept here so
 * both the admin key-management screen and the API auth path share the same
 * hashing logic.
 */
export async function findActiveKeyByRawValue(rawKey: string) {
  const keyHash = hashKey(rawKey);
  return ApiKey.findOne({ where: { keyHash, active: true } });
}

export async function touchLastUsed(id: string) {
  // Fire-and-forget from the caller's perspective; awaited here for correctness,
  // but callers should not let a failure here block the request.
  await ApiKey.update({ lastUsedAt: new Date() }, { where: { id } });
}
