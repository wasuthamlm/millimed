import { authenticate } from "@/lib/api/authenticate";
import { handle, ok } from "@/lib/api/respond";
import * as popupConfigService from "@/lib/services/popup-config";

export async function GET(request: Request) {
  return handle(async () => {
    await authenticate(request);
    return ok(await popupConfigService.getPopupConfig());
  });
}

export async function PUT(request: Request) {
  return handle(async () => {
    await authenticate(request);
    const body = await request.json();
    return ok(await popupConfigService.savePopupConfig(body));
  });
}
