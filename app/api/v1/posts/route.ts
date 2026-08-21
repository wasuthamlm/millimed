import { authenticate } from "@/lib/api/authenticate";
import { handle, ok } from "@/lib/api/respond";
import { parsePagination, paginationMeta } from "@/lib/api/pagination";
import * as postService from "@/lib/services/posts";

export async function GET(request: Request) {
  return handle(async () => {
    await authenticate(request);
    const url = new URL(request.url);
    const params = parsePagination(url);
    const kind = url.searchParams.get("kind") as "ARTICLE" | "NEWS" | null;
    const status = url.searchParams.get("status") as "DRAFT" | "PUBLISHED" | null;
    const { items, total } = await postService.listPosts({
      ...params,
      kind: kind ?? undefined,
      status: status ?? undefined,
    });
    return ok(items, { meta: paginationMeta(params, total) });
  });
}

export async function POST(request: Request) {
  return handle(async () => {
    await authenticate(request);
    const body = await request.json();
    const post = await postService.createPost(body);
    return ok(post, { status: 201 });
  });
}
