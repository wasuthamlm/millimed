import { authenticate } from "@/lib/api/authenticate";
import { handle, ok } from "@/lib/api/respond";
import * as headerConfigService from "@/lib/services/header-config";

export async function GET(request: Request) {
  return handle(async () => {
    await authenticate(request);
    return ok(await headerConfigService.getHeaderConfig());
  });
}

export async function PUT(request: Request) {
  return handle(async () => {
    await authenticate(request);
    const body = await request.json();
    return ok(await headerConfigService.saveHeaderConfig(body));
  });
}
