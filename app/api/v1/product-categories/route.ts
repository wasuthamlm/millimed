import { authenticate } from "@/lib/api/authenticate";
import { handle, ok } from "@/lib/api/respond";
import { parsePagination, paginationMeta } from "@/lib/api/pagination";
import * as productCategoryService from "@/lib/services/product-categories";

export async function GET(request: Request) {
  return handle(async () => {
    await authenticate(request);
    const params = parsePagination(new URL(request.url));
    const { items, total } = await productCategoryService.listProductCategories(params);
    return ok(items, { meta: paginationMeta(params, total) });
  });
}

export async function POST(request: Request) {
  return handle(async () => {
    await authenticate(request);
    const body = await request.json();
    const category = await productCategoryService.createProductCategory(body);
    return ok(category, { status: 201 });
  });
}
