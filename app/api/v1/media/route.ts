import { authenticate } from "@/lib/api/authenticate";
import { handle, ok } from "@/lib/api/respond";
import { parsePagination, paginationMeta } from "@/lib/api/pagination";
import * as mediaService from "@/lib/services/media";

// Uploads stay on the existing session-gated POST /api/admin/media (Cloudinary) —
// this endpoint only lists what's already there for an external CMS to browse.
export async function GET(request: Request) {
  return handle(async () => {
    await authenticate(request);
    const url = new URL(request.url);
    const params = parsePagination(url);
    const folderId = url.searchParams.get("folderId");
    const { items, total } = await mediaService.listMedia({
      ...params,
      folderId: folderId === null ? undefined : folderId || null,
    });
    return ok(items, { meta: paginationMeta(params, total) });
  });
}
