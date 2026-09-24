import Script from "next/script";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { SecretAdminAccess } from "@/components/layout/SecretAdminAccess";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { TrackingConsentGate } from "@/components/layout/TrackingConsentGate";
import { getHeaderNavLinks } from "@/lib/queries/nav";
import { getFooterData } from "@/lib/queries/footer";
import { getSiteLogo, getSiteMeta } from "@/lib/queries/site-settings";
import { isWidgetEnabled } from "@/lib/queries/widgets";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [navLinks, footerData, logoUrl, siteMeta, cookieConsentEnabled] = await Promise.all([
    getHeaderNavLinks(),
    getFooterData(),
    getSiteLogo(),
    getSiteMeta(),
    isWidgetEnabled("cookie-consent"),
  ]);

  return (
    <>
      {cookieConsentEnabled && (
        // Google Consent Mode v2 — everything optional starts denied, before GTM/gtag
        // parse any tags. A plain inline <script> (not next/script's beforeInteractive
        // strategy): that strategy is only hoisted into <head> server-side when declared
        // in the app-level ROOT layout — here, in the nested (site) layout, it would get
        // client-injected like any other strategy and arrive too late. A literal <script>
        // tag is part of the server HTML and runs synchronously in document order, ahead
        // of the afterInteractive GTM/GA4 <Script> tags right below it. gtag.js and GTM
        // both read this signal on their own once they load, so those scripts stay
        // unconditional — only Meta/TikTok (no built-in consent awareness) are gated to
        // not load at all, via TrackingConsentGate further down.
        <script
          id="consent-default"
          dangerouslySetInnerHTML={{
            __html:
              "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});",
          }}
        />
      )}
      {siteMeta.gtmId && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${siteMeta.gtmId}');`}
        </Script>
      )}
      {siteMeta.ga4Id && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${siteMeta.ga4Id}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${siteMeta.ga4Id}');`}
          </Script>
        </>
      )}
      {cookieConsentEnabled && (
        <TrackingConsentGate fbPixelId={siteMeta.fbPixelId} tiktokPixelId={siteMeta.tiktokPixelId} />
      )}
      <Navbar navLinks={navLinks} logoUrl={logoUrl ?? undefined} />
      <main className="flex-1">{children}</main>
      <Footer columns={footerData.columns} contact={footerData.contact} config={footerData.config} />
      <ScrollToTopButton />
      {cookieConsentEnabled && <CookieConsent />}
      <SecretAdminAccess />
    </>
  );
}
