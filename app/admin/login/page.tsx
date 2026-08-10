import { Suspense } from "react";
import Image from "next/image";
import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { SiteSettings, Media } from "@/lib/db/models/index";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบผู้ดูแล",
  robots: { index: false, follow: false },
};

// Reads SiteSettings (logo/login background) — must not be prerendered as static,
// or a changed asset in Settings won't show until the next full rebuild.
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const siteSettings = await SiteSettings.findByPk("singleton", {
    include: [
      { model: Media, as: "logo" },
      { model: Media, as: "loginBg" },
    ],
  });
  const logo = siteSettings?.get("logo") as Media | null;
  const loginBg = siteSettings?.get("loginBg") as Media | null;

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-8 bg-cover bg-center px-4"
      style={loginBg?.url ? { backgroundImage: `url(${loginBg.url})` } : undefined}
    >
      <div
        className={
          loginBg?.url
            ? "flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2 backdrop-blur-sm"
            : "flex items-center gap-2"
        }
      >
        <Image
          src={logo?.url || "/logo.svg"}
          alt={siteSettings?.siteNameTh || "Millimed"}
          width={40}
          height={40}
          unoptimized={!!logo?.url}
        />
        <div className="flex flex-col leading-tight">
          <span className="text-base font-bold text-brand-navy">{siteSettings?.siteNameTh || "มิลลิเมด"}</span>
          <span className="text-xs text-slate-400">Admin Control</span>
        </div>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-lg font-semibold text-slate-800">เข้าสู่ระบบผู้ดูแลเว็บไซต์</h1>
        <Suspense>
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
