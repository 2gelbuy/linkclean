/**
 * Analytics for Chrome extensions via GA4 Measurement Protocol.
 *
 * Sends anonymous events to GA4. No cookies, no PII.
 * Also keeps local copy in chrome.storage.local.
 */

const GA4_MEASUREMENT_ID = "G-FJRY9ECL0B";
const GA4_API_SECRET = ""; // TODO: Add API secret from GA4 Admin → Data Streams → Measurement Protocol
const GA4_ENDPOINT = `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`;

const ANALYTICS_KEY = "mirana_analytics";
const CLIENT_ID_KEY = "mirana_client_id";

interface AnalyticsEvent {
  event: string;
  props?: Record<string, string | number | boolean>;
  ts: number;
}

interface AnalyticsStore {
  events: AnalyticsEvent[];
  installDate: string | null;
  version: string;
}

const DEFAULT_STORE: AnalyticsStore = {
  events: [],
  installDate: null,
  version: chrome.runtime.getManifest().version,
};

/** Get or create a persistent anonymous client ID */
async function getClientId(): Promise<string> {
  const result = await chrome.storage.local.get(CLIENT_ID_KEY);
  if (result[CLIENT_ID_KEY]) return result[CLIENT_ID_KEY];
  const id = crypto.randomUUID();
  await chrome.storage.local.set({ [CLIENT_ID_KEY]: id });
  return id;
}

/** Send event to GA4 via Measurement Protocol */
async function sendToGA4(
  eventName: string,
  params?: Record<string, string | number | boolean>,
): Promise<void> {
  if (!GA4_API_SECRET) return; // Skip if API secret not configured
  try {
    const clientId = await getClientId();
    await fetch(GA4_ENDPOINT, {
      method: "POST",
      body: JSON.stringify({
        client_id: clientId,
        events: [
          {
            name: eventName,
            params: {
              ...params,
              engagement_time_msec: "1000",
              session_id: String(Date.now()),
            },
          },
        ],
      }),
    });
  } catch {
    // GA4 send failed — silently ignore, local tracking still works
  }
}

export async function trackEvent(
  event: string,
  props?: Record<string, string | number | boolean>,
): Promise<void> {
  // Local storage
  const result = await chrome.storage.local.get(ANALYTICS_KEY);
  const store: AnalyticsStore = result[ANALYTICS_KEY] ?? DEFAULT_STORE;
  store.events.push({ event, props, ts: Date.now() });
  if (store.events.length > 500) {
    store.events = store.events.slice(-500);
  }
  await chrome.storage.local.set({ [ANALYTICS_KEY]: store });

  // GA4
  await sendToGA4(event, props);
}

export async function trackInstall(): Promise<void> {
  const result = await chrome.storage.local.get(ANALYTICS_KEY);
  const store: AnalyticsStore = result[ANALYTICS_KEY] ?? DEFAULT_STORE;
  store.installDate = new Date().toISOString();
  store.version = chrome.runtime.getManifest().version;
  await chrome.storage.local.set({ [ANALYTICS_KEY]: store });
  await trackEvent("install", { version: store.version });
}

export async function getAnalytics(): Promise<AnalyticsStore> {
  const result = await chrome.storage.local.get(ANALYTICS_KEY);
  return result[ANALYTICS_KEY] ?? DEFAULT_STORE;
}
