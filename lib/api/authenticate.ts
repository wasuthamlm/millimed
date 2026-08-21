import { forbidden, unauthorized } from "@/lib/services/errors";
import * as apiKeyService from "@/lib/services/api-keys";
import type { ApiKeyScope } from "@/lib/db/models/ApiKey";

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function requiredScopeFor(method: string): ApiKeyScope {
  return WRITE_METHODS.has(method.toUpperCase()) ? "write" : "read";
}

/**
 * Validates the `x-api-key` header for an incoming Request against the ApiKey
 * table. Must be called explicitly inside each app/api/v1/** Route Handler —
 * it cannot live in proxy.ts/middleware, which runs on the edge runtime and
 * has no Sequelize/DB access (see lib/auth.config.ts).
 */
export async function authenticate(request: Request) {
  const rawKey = request.headers.get("x-api-key");
  if (!rawKey) throw unauthorized("Missing x-api-key header");

  const key = await apiKeyService.findActiveKeyByRawValue(rawKey);
  if (!key) throw unauthorized("Invalid or inactive API key");

  const scope = requiredScopeFor(request.method);
  if (!key.scopes.includes(scope)) {
    throw forbidden(`This API key does not have "${scope}" scope`);
  }

  void apiKeyService.touchLastUsed(key.id).catch(() => {});

  return key;
}
