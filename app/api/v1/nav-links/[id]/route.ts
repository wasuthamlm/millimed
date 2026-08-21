import { authenticate } from "@/lib/api/authenticate";
import { handle, ok } from "@/lib/api/respond";
import * as navLinkService from "@/lib/services/nav-links";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await authenticate(request);
    const { id } = await params;
    return ok(await navLinkService.getNavLink(id));
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await authenticate(request);
    const { id } = await params;
    const body = await request.json();
    return ok(await navLinkService.updateNavLink(id, body));
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await authenticate(request);
    const { id } = await params;
    await navLinkService.deleteNavLink(id);
    return ok({ deleted: true });
  });
}
