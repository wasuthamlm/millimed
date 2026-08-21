import { authenticate } from "@/lib/api/authenticate";
import { handle, ok } from "@/lib/api/respond";
import * as bannerService from "@/lib/services/banners";

export async function GET(request: Request) {
  return handle(async () => {
    await authenticate(request);
    const banners = await bannerService.listBanners();
    return ok(banners);
  });
}

export async function PUT(request: Request) {
  return handle(async () => {
    await authenticate(request);
    const body = await request.json();
    await bannerService.saveBanners(body.banners ?? body);
    return ok(await bannerService.listBanners());
  });
}
