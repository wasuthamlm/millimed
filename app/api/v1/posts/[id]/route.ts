import { authenticate } from "@/lib/api/authenticate";
import { handle, ok } from "@/lib/api/respond";
import * as postService from "@/lib/services/posts";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await authenticate(request);
    const { id } = await params;
    return ok(await postService.getPost(id));
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await authenticate(request);
    const { id } = await params;
    const body = await request.json();
    return ok(await postService.updatePost(id, body));
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await authenticate(request);
    const { id } = await params;
    await postService.deletePost(id);
    return ok({ deleted: true });
  });
}
