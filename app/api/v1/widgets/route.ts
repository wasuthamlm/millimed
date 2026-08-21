import { authenticate } from "@/lib/api/authenticate";
import { handle, ok } from "@/lib/api/respond";
import * as widgetService from "@/lib/services/widgets";

export async function GET(request: Request) {
  return handle(async () => {
    await authenticate(request);
    return ok(await widgetService.listWidgets());
  });
}

export async function PUT(request: Request) {
  return handle(async () => {
    await authenticate(request);
    const body = await request.json();
    return ok(await widgetService.saveWidgets(body.widgets ?? body));
  });
}
