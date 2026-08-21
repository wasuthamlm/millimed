import type { Model } from "sequelize";

/**
 * Picks a safe, explicit field whitelist from a Sequelize instance (or plain
 * object) for API JSON output. Never spread/JSON.stringify a raw model that
 * has an association include on it — e.g. Post.author (User) carries
 * passwordHash, and there is no defaultScope excluding it (NextAuth's
 * credentials login needs to read it), so an unwhitelisted include would
 * leak password hashes to any read-scoped external API key.
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  source: T,
  keys: readonly K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = source[key];
  }
  return result;
}

function toPlain<T extends Model>(instance: T): Record<string, unknown> {
  return typeof (instance as unknown as { toJSON?: () => Record<string, unknown> }).toJSON === "function"
    ? (instance as unknown as { toJSON: () => Record<string, unknown> }).toJSON()
    : (instance as unknown as Record<string, unknown>);
}

/** Safe public shape for a User association (author, uploadedBy, etc). Never include passwordHash/email here for external API responses beyond what's needed. */
export function serializeUserRef(user: unknown) {
  if (!user) return null;
  const plain = toPlain(user as Model);
  return pick(plain as { id: string; name: string | null }, ["id", "name"]);
}

/** Safe shape for a Media association. */
export function serializeMediaRef(media: unknown) {
  if (!media) return null;
  const plain = toPlain(media as Model);
  return pick(plain as { id: string; url: string; filename: string }, ["id", "url", "filename"]);
}
