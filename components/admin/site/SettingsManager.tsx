"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Toggle } from "@/components/admin/Toggle";
import { SaveButton } from "@/components/admin/SaveButton";
import { saveSiteSettings, saveGlobalTheme } from "@/app/admin/settings/actions";
import type { SiteSettingsInput, GlobalThemeInput } from "@/data/admin-settings";

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy";
const labelClass = "mb-1.5 block text-xs font-medium text-slate-500";
const cardClass = "flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm";

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-11 shrink-0 cursor-pointer rounded-md border border-slate-200 p-1"
        />
        <input className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

export function SettingsManager({
  initialSettings,
  initialTheme,
}: {
  initialSettings: SiteSettingsInput;
  initialTheme: GlobalThemeInput;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [theme, setTheme] = useState(initialTheme);

  const updateSettings = <K extends keyof SiteSettingsInput>(key: K, value: SiteSettingsInput[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));
  const updateTheme = <K extends keyof GlobalThemeInput>(key: K, value: GlobalThemeInput[K]) =>
    setTheme((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="flex flex-col gap-6">
      <div className={cardClass}>
        <h2 className="text-sm font-semibold text-slate-900">ข้อมูลเว็บไซต์</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>ชื่อเว็บไซต์ (TH)</label>
            <input className={inputClass} value={settings.siteNameTh} onChange={(e) => updateSettings("siteNameTh", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>ชื่อเว็บไซต์ (EN)</label>
            <input className={inputClass} value={settings.siteNameEn} onChange={(e) => updateSettings("siteNameEn", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Site URL</label>
            <input className={inputClass} placeholder="https://www.millimedthailand.com" value={settings.siteUrl} onChange={(e) => updateSettings("siteUrl", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>ลิงก์วิดีโอแนะนำเว็บไซต์ (YouTube)</label>
            <input className={inputClass} placeholder="https://www.youtube.com/watch?v=..." value={settings.youtubeEmbedUrl} onChange={(e) => updateSettings("youtubeEmbedUrl", e.target.value)} />
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="text-sm font-semibold text-slate-900">Logo และรูปภาพระบบ</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          <ImageUploader label="Logo" value={settings.logo} onChange={(v) => updateSettings("logo", v)} />
          <ImageUploader label="Favicon" value={settings.favicon} onChange={(v) => updateSettings("favicon", v)} />
          <ImageUploader label="พื้นหลังหน้า Login" value={settings.loginBg} onChange={(v) => updateSettings("loginBg", v)} />
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="text-sm font-semibold text-slate-900">SEO เริ่มต้นของเว็บไซต์</h2>
        <p className="-mt-2 text-xs text-slate-400">ใช้เป็นค่าเริ่มต้นเมื่อหน้านั้นๆ ไม่ได้ตั้งค่า SEO ของตัวเองไว้</p>
        <div>
          <label className={labelClass}>SEO Meta Title</label>
          <input className={inputClass} value={settings.seoMetaTitleTh} onChange={(e) => updateSettings("seoMetaTitleTh", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>SEO Meta Description</label>
          <textarea className={inputClass} rows={3} value={settings.seoMetaDescTh} onChange={(e) => updateSettings("seoMetaDescTh", e.target.value)} />
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="text-sm font-semibold text-slate-900">Tracking / Analytics</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Google Tag Manager ID</label>
            <input className={inputClass} placeholder="GTM-XXXXXXX" value={settings.gtmId} onChange={(e) => updateSettings("gtmId", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Google Analytics 4 ID</label>
            <input className={inputClass} placeholder="G-XXXXXXXXXX" value={settings.ga4Id} onChange={(e) => updateSettings("ga4Id", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Facebook Pixel ID</label>
            <input className={inputClass} value={settings.fbPixelId} onChange={(e) => updateSettings("fbPixelId", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>TikTok Pixel ID</label>
            <input className={inputClass} value={settings.tiktokPixelId} onChange={(e) => updateSettings("tiktokPixelId", e.target.value)} />
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="text-sm font-semibold text-slate-900">โซเชียลมีเดีย</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Facebook URL</label>
            <input className={inputClass} value={settings.facebookUrl} onChange={(e) => updateSettings("facebookUrl", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Instagram URL</label>
            <input className={inputClass} value={settings.instagramUrl} onChange={(e) => updateSettings("instagramUrl", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>YouTube URL</label>
            <input className={inputClass} value={settings.youtubeUrl} onChange={(e) => updateSettings("youtubeUrl", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>TikTok URL</label>
            <input className={inputClass} value={settings.tiktokUrl} onChange={(e) => updateSettings("tiktokUrl", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Line URL</label>
            <input className={inputClass} value={settings.lineUrl} onChange={(e) => updateSettings("lineUrl", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>รูปแบบไอคอนโซเชียล</label>
            <select className={inputClass} value={settings.socialIconStyle} onChange={(e) => updateSettings("socialIconStyle", e.target.value)}>
              <option value="filled">Filled</option>
              <option value="outline">Outline</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-slate-700">แสดงไอคอนโซเชียลใน Header</p>
            <p className="text-xs text-slate-400">นอกเหนือจาก Footer ที่แสดงอยู่แล้ว</p>
          </div>
          <Toggle checked={settings.showSocialInHeader} onChange={(v) => updateSettings("showSocialInHeader", v)} label="แสดงไอคอนโซเชียลใน Header" />
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton label="บันทึกการตั้งค่าเว็บไซต์" onSave={() => saveSiteSettings(settings)} />
      </div>

      <div className={cardClass}>
        <h2 className="text-sm font-semibold text-slate-900">ธีมสีและฟอนต์ทั้งเว็บไซต์</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>ฟอนต์หัวข้อ</label>
            <select className={inputClass} value={theme.fontHeader} onChange={(e) => updateTheme("fontHeader", e.target.value)}>
              <option value="thai">Thai (IBM Plex Sans Thai)</option>
              <option value="latin">Latin (Inter)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>ฟอนต์เนื้อหา</label>
            <select className={inputClass} value={theme.fontBody} onChange={(e) => updateTheme("fontBody", e.target.value)}>
              <option value="thai">Thai (IBM Plex Sans Thai)</option>
              <option value="latin">Latin (Inter)</option>
            </select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <ColorField label="สีหลัก (Primary)" value={theme.colorPrimary} onChange={(v) => updateTheme("colorPrimary", v)} />
          <ColorField label="สีหลัก Hover" value={theme.colorPrimaryHover} onChange={(v) => updateTheme("colorPrimaryHover", v)} />
          <ColorField label="สีเน้น (Accent)" value={theme.colorAccent} onChange={(v) => updateTheme("colorAccent", v)} />
          <ColorField label="สีพื้นหลัง" value={theme.colorBackground} onChange={(v) => updateTheme("colorBackground", v)} />
          <ColorField label="สีตัวอักษร" value={theme.colorText} onChange={(v) => updateTheme("colorText", v)} />
          <div>
            <label className={labelClass}>ความมนของปุ่ม (Button Radius)</label>
            <input className={inputClass} value={theme.buttonRadius} onChange={(e) => updateTheme("buttonRadius", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton label="บันทึกธีม" onSave={() => saveGlobalTheme(theme)} />
      </div>
    </div>
  );
}
