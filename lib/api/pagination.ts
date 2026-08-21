import { Op } from "sequelize";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
  updatedSince?: Date;
}

/** Parses ?page=&limit=&updatedSince= from a Route Handler's request URL. */
export function parsePagination(url: URL): PaginationParams {
  const rawPage = Number(url.searchParams.get("page") ?? "1");
  const rawLimit = Number(url.searchParams.get("limit") ?? String(DEFAULT_LIMIT));

  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(Math.floor(rawLimit), MAX_LIMIT) : DEFAULT_LIMIT;

  const updatedSinceRaw = url.searchParams.get("updatedSince");
  const updatedSince = updatedSinceRaw ? new Date(updatedSinceRaw) : undefined;

  return {
    page,
    limit,
    offset: (page - 1) * limit,
    updatedSince: updatedSince && !Number.isNaN(updatedSince.getTime()) ? updatedSince : undefined,
  };
}

export function updatedSinceWhere(updatedSince?: Date) {
  return updatedSince ? { updatedAt: { [Op.gte]: updatedSince } } : undefined;
}

export function paginationMeta(params: PaginationParams, total: number) {
  return { page: params.page, limit: params.limit, total, totalPages: Math.ceil(total / params.limit) };
}
