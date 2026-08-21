import { authenticate } from "@/lib/api/authenticate";
import { handle, ok } from "@/lib/api/respond";
import * as bannerService from "@/lib/services/banners";

export async function GET(request: Request) {
  return handle(async () => {
    await authenticate(request);
    return ok(await bannerService.getBannerConfig());
  });
}

export async function PUT(request: Request) {
  return handle(async () => {
    await authenticate(request);
    const body = await request.json();
    return ok(await bannerService.saveBannerConfig(body));
  });
}
