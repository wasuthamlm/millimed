import { authenticate } from "@/lib/api/authenticate";
import { handle, ok } from "@/lib/api/respond";
import * as articleCategoryService from "@/lib/services/article-categories";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await authenticate(request);
    const { id } = await params;
    const category = await articleCategoryService.getArticleCategory(id);
    return ok(category);
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await authenticate(request);
    const { id } = await params;
    const body = await request.json();
    const category = await articleCategoryService.updateArticleCategory(id, body);
    return ok(category);
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await authenticate(request);
    const { id } = await params;
    await articleCategoryService.deleteArticleCategory(id);
    return ok({ deleted: true });
  });
}
