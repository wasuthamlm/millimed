import { authenticate } from "@/lib/api/authenticate";
import { handle, ok } from "@/lib/api/respond";
import * as pageService from "@/lib/services/pages";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await authenticate(request);
    const { id } = await params;
    return ok(await pageService.getPage(id));
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await authenticate(request);
    const { id } = await params;
    const body = await request.json();
    if (body.status) await pageService.setPageStatus(id, body.status);
    if (body.seo) await pageService.setPageSeo(id, body.seo);
    return ok(await pageService.getPage(id));
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await authenticate(request);
    const { id } = await params;
    await pageService.deletePage(id);
    return ok({ deleted: true });
  });
}
