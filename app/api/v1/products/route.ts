import { authenticate } from "@/lib/api/authenticate";
import { handle, ok } from "@/lib/api/respond";
import { parsePagination, paginationMeta } from "@/lib/api/pagination";
import * as productService from "@/lib/services/products";

export async function GET(request: Request) {
  return handle(async () => {
    await authenticate(request);
    const url = new URL(request.url);
    const params = parsePagination(url);
    const status = url.searchParams.get("status") as "ACTIVE" | "DRAFT" | "ARCHIVED" | null;
    const { items, total } = await productService.listProducts({ ...params, status: status ?? undefined });
    return ok(items, { meta: paginationMeta(params, total) });
  });
}

export async function POST(request: Request) {
  return handle(async () => {
    await authenticate(request);
    const body = await request.json();
    const product = await productService.createProduct(body);
    return ok(product, { status: 201 });
  });
}
