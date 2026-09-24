"use client";

// Consent store — single source of truth for cookie consent state, ported from the
// implementation built for the Millimed BFS site (C:\Millimed\millimedbfs\millimedbfs-frontend\lib\consent\consentStore.ts),
// itself ported from the legacy millimedbfs.com source app's real consent system —
// this site's own legacy (millimedthailand.com) never had one. Consent Mode v2: default-denied is pushed from
// app/(site)/layout.tsx BEFORE GTM/gtag load; this module restores a returning
// visitor's choice via gtag('consent','update').
//
// Simplified from the source on purpose: no legacy-storage-key migration (this
// project has no prior visitors under an older key) and no GTM-id-changed reload
// (the id is set once by an admin, not hot-swapped at runtime here).

export const CONSENT_VERSION = "1.0";
export const STORAGE_KEY = "millimed_cookie_consent";
const RELOAD_FLAG = "millimed_consent_reloaded";

export type ConsentRecord = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
};

const DENIED: ConsentRecord = { necessary: true, analytics: false, marketing: false, timestamp: "" };

let record: ConsentRecord | null = null; // validated consent record, or null when undecided
let decided = false; // explicit decision flag — never derived from truthiness
let ready = false; // true once the stored record has been read + restored
const listeners = new Set<() => void>();

declare global {
  interface Window {
    dataLayer?: unknown[];
    __millimedConsentReady?: boolean;
    __millimedMetaPixelLoaded?: boolean;
    __millimedTikTokPixelLoaded?: boolean;
    fbq?: (...args: unknown[]) => void;
    ttq?: { disableCookie?: () => void; page?: () => void; [k: string]: unknown };
  }
}

/** Pushes a Consent Mode v2 update built from a consent record */
function pushConsentUpdate(c: ConsentRecord) {
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  }
  gtag("consent", "update", {
    analytics_storage: c.analytics ? "granted" : "denied",
    ad_storage: c.marketing ? "granted" : "denied",
    ad_user_data: c.marketing ? "granted" : "denied",
    ad_personalization: c.marketing ? "granted" : "denied",
  });
  window.dataLayer.push({
    event: "millimed_consent_updated",
    millimed_analytics_consent: c.analytics ? "granted" : "denied",
    millimed_marketing_consent: c.marketing ? "granted" : "denied",
  });
}

/**
 * Strict validation — `false` is a meaningful value, so every flag is checked by
 * type, never by truthiness (a truthy check would silently drop "Reject").
 */
function isValidRecord(r: unknown): r is ConsentRecord & { version: string } {
  if (!r || typeof r !== "object") return false;
  const c = r as Record<string, unknown>;
  return (
    c.version === CONSENT_VERSION &&
    c.necessary === true &&
    typeof c.analytics === "boolean" &&
    typeof c.marketing === "boolean" &&
    typeof c.timestamp === "string" &&
    !Number.isNaN(Date.parse(c.timestamp as string))
  );
}

function readStored(): ConsentRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isValidRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Startup: read the record and restore consent before anything else runs. */
export function hydrateConsent(): ConsentRecord | null {
  if (ready) return record;
  const stored = readStored();
  record = stored
    ? { necessary: true, analytics: stored.analytics, marketing: stored.marketing, timestamp: stored.timestamp }
    : null;
  decided = !!stored;
  if (record) pushConsentUpdate(record);
  ready = true;
  window.__millimedConsentReady = true;
  notify();
  return record;
}

export const isConsentReady = () => ready;
export const getConsent = (): ConsentRecord => record ?? { ...DENIED };
export const hasDecision = () => decided;

function notify() {
  listeners.forEach((fn) => fn());
}

export function subscribeConsent(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function deleteTrackingCookies() {
  const names = document.cookie.split(";").map((c) => c.split("=")[0].trim());
  const targets = names.filter((n) => /^(_fbp|_fbc|_ga|_ga_.*|_gid|_gcl_.*|_ttp)$/.test(n));
  const host = window.location.hostname;
  const domains = [undefined, host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  targets.forEach((name) => {
    domains.forEach((d) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? `; domain=${d}` : ""}`;
    });
  });
}

/**
 * Persists a decision, updates Consent Mode, and revokes marketing runtimes when needed.
 * Returns { reloaded: boolean } — a single reload is used to stop already-loaded pixel SDKs
 * (a third-party script cannot be unloaded from a live document).
 */
export function saveConsent({ analytics, marketing }: { analytics: boolean; marketing: boolean }): {
  reloaded: boolean;
} {
  const prevMarketing = record?.marketing === true;
  const next: ConsentRecord = {
    necessary: true,
    analytics: analytics === true,
    marketing: marketing === true,
    timestamp: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: CONSENT_VERSION, ...next }));
  } catch {}
  record = next;
  decided = true;
  ready = true;
  window.__millimedConsentReady = true;
  pushConsentUpdate(record);

  const revokingMarketing = prevMarketing && !next.marketing;
  if (!next.marketing) {
    try {
      if (window.__millimedMetaPixelLoaded && typeof window.fbq === "function") window.fbq("consent", "revoke");
    } catch {}
    try {
      if (window.__millimedTikTokPixelLoaded && window.ttq?.disableCookie) window.ttq.disableCookie();
    } catch {}
    deleteTrackingCookies();
  }
  notify();

  if (revokingMarketing && (window.__millimedMetaPixelLoaded || window.__millimedTikTokPixelLoaded)) {
    let alreadyReloaded = false;
    try {
      alreadyReloaded = sessionStorage.getItem(RELOAD_FLAG) === "1";
    } catch {}
    if (!alreadyReloaded) {
      try {
        sessionStorage.setItem(RELOAD_FLAG, "1");
      } catch {}
      window.setTimeout(() => window.location.reload(), 600);
      return { reloaded: true };
    }
  }
  return { reloaded: false };
}
