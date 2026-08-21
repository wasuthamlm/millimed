import { authenticate } from "@/lib/api/authenticate";
import { handle, ok } from "@/lib/api/respond";
import * as pageSectionService from "@/lib/services/page-sections";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await authenticate(request);
    const { id } = await params;
    return ok(await pageSectionService.listSections(id));
  });
}

// Replace-all semantics, matching the admin page-builder's saveSections
// (destroy + bulkCreate in a transaction) — not a partial patch.
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await authenticate(request);
    const { id } = await params;
    const body = await request.json();
    await pageSectionService.saveSections(id, body.sections ?? body);
    return ok(await pageSectionService.listSections(id));
  });
}
