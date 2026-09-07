import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { IBM_Plex_Sans_Thai, Inter } from "next/font/google";
import { getGlobalTheme, getSiteMeta } from "@/lib/queries/site-settings";
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

function safeUrl(value: string | null): URL | undefined {
  if (!value) return undefined;
  try {
    return new URL(value);
  } catch {
    return undefined;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getSiteMeta();
  return {
    title: {
      default: meta.seoMetaTitleTh || meta.siteNameTh,
      template: `%s | ${meta.siteNameTh}`,
    },
    description:
      meta.seoMetaDescTh || "Millimed ผู้ผลิตและจำหน่ายผลิตภัณฑ์เวชภัณฑ์และการดูแลสุขภาพชั้นนำของไทย",
    metadataBase: safeUrl(meta.siteUrl),
    icons: meta.faviconUrl ? { icon: meta.faviconUrl } : undefined,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [theme, meta] = await Promise.all([getGlobalTheme(), getSiteMeta()]);

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
      <head>
        {meta.gtmId && (
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${meta.gtmId}');`}
          </Script>
        )}
      </head>
      <body className="flex min-h-screen flex-col" style={themeVars}>
        {meta.gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${meta.gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        {meta.ga4Id && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${meta.ga4Id}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${meta.ga4Id}');`}
            </Script>
          </>
        )}
        {meta.fbPixelId && (
          <Script id="fb-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '${meta.fbPixelId}');fbq('track', 'PageView');`}
          </Script>
        )}
        {meta.tiktokPixelId && (
          <Script id="tiktok-pixel" strategy="afterInteractive">
            {`!function (w, d, t) {w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${meta.tiktokPixelId}');ttq.page();}(window, document, 'ttq');`}
          </Script>
        )}
        {children}
      </body>
    </html>
  );
}
