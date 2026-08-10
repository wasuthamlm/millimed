import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai, Inter } from "next/font/google";
import { getGlobalTheme } from "@/lib/queries/site-settings";
import "./globals.css";

const plexThai = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-thai",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-thai-fallback",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Millimed",
    template: "%s | Millimed",
  },
  description:
    "Millimed ผู้ผลิตและจำหน่ายผลิตภัณฑ์เวชภัณฑ์และการดูแลสุขภาพชั้นนำของไทย",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const theme = await getGlobalTheme();

  const themeVars = theme
    ? ({
        "--brand-navy": theme.colorPrimary,
        "--brand-navy-dark": theme.colorPrimaryHover,
        "--brand-gold": theme.colorAccent,
        "--background": theme.colorBackground,
        "--foreground": theme.colorText,
        "--radius-btn": theme.buttonRadius,
      } as CSSProperties)
    : undefined;

  return (
    <html lang="th" className={`${plexThai.variable} ${inter.variable} antialiased`}>
      <body className="flex min-h-screen flex-col" style={themeVars}>
        {children}
      </body>
    </html>
  );
}
