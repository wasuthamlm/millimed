import { authenticate } from "@/lib/api/authenticate";
import { handle, ok } from "@/lib/api/respond";
import { parsePagination, paginationMeta } from "@/lib/api/pagination";
import * as navLinkService from "@/lib/services/nav-links";

export async function GET(request: Request) {
  return handle(async () => {
    await authenticate(request);
    const params = parsePagination(new URL(request.url));
    const { items, total } = await navLinkService.listNavLinks(params);
    return ok(items, { meta: paginationMeta(params, total) });
  });
}

export async function POST(request: Request) {
  return handle(async () => {
    await authenticate(request);
    const body = await request.json();
    const link = await navLinkService.createNavLink(body);
    return ok(link, { status: 201 });
  });
}
