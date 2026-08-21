import { authenticate } from "@/lib/api/authenticate";
import { handle, ok } from "@/lib/api/respond";
import { parsePagination, paginationMeta } from "@/lib/api/pagination";
import * as pageService from "@/lib/services/pages";

export async function GET(request: Request) {
  return handle(async () => {
    await authenticate(request);
    const url = new URL(request.url);
    const params = parsePagination(url);
    const archivedParam = url.searchParams.get("archived");
    const { items, total } = await pageService.listPages({
      ...params,
      archived: archivedParam === null ? undefined : archivedParam === "true",
    });
    return ok(items, { meta: paginationMeta(params, total) });
  });
}

export async function POST(request: Request) {
  return handle(async () => {
    await authenticate(request);
    const body = await request.json();
    const page = await pageService.createPage(body);
    return ok(page, { status: 201 });
  });
}
