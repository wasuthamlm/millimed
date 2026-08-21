import { authenticate } from "@/lib/api/authenticate";
import { handle, ok } from "@/lib/api/respond";
import * as productCategoryService from "@/lib/services/product-categories";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await authenticate(request);
    const { id } = await params;
    return ok(await productCategoryService.getProductCategory(id));
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await authenticate(request);
    const { id } = await params;
    const body = await request.json();
    return ok(await productCategoryService.updateProductCategory(id, body));
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await authenticate(request);
    const { id } = await params;
    await productCategoryService.deleteProductCategory(id);
    return ok({ deleted: true });
  });
}
