import { authenticate } from "@/lib/api/authenticate";
import { handle, ok } from "@/lib/api/respond";
import { getFooterData } from "@/lib/queries/footer";
import * as footerService from "@/lib/services/footer";

export async function GET(request: Request) {
  return handle(async () => {
    await authenticate(request);
    return ok(await getFooterData());
  });
}

export async function PUT(request: Request) {
  return handle(async () => {
    await authenticate(request);
    const body = await request.json();
    await footerService.saveFooterConfig(body.columns, body.contact, body.theme);
    return ok(await getFooterData());
  });
}
