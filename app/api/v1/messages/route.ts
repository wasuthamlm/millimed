import { authenticate } from "@/lib/api/authenticate";
import { handle, ok } from "@/lib/api/respond";
import { parsePagination, paginationMeta } from "@/lib/api/pagination";
import * as messageService from "@/lib/services/messages";

export async function GET(request: Request) {
  return handle(async () => {
    await authenticate(request);
    const params = parsePagination(new URL(request.url));
    const { items, total } = await messageService.listMessages(params);
    return ok(items, { meta: paginationMeta(params, total) });
  });
}
