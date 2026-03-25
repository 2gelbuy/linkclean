/**
 * Privacy-first analytics for Chrome extensions.
 *
 * No external tracking by default — all data stays in chrome.storage.local.
 * Optionally send anonymous events to your own endpoint.
 *
 * Events tracked:
 * - install, update (from background.ts)
 * - popup_open, feature_used, upgrade_click
 */

const ANALYTICS_KEY = 'mirana_analytics';

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

export async function trackEvent(
  event: string,
  props?: Record<string, string | number | boolean>,
): Promise<void> {
  const result = await chrome.storage.local.get(ANALYTICS_KEY);
  const store: AnalyticsStore = result[ANALYTICS_KEY] ?? DEFAULT_STORE;

  store.events.push({ event, props, ts: Date.now() });

  // Keep last 500 events max
  if (store.events.length > 500) {
    store.events = store.events.slice(-500);
  }

  await chrome.storage.local.set({ [ANALYTICS_KEY]: store });
}

export async function trackInstall(): Promise<void> {
  const result = await chrome.storage.local.get(ANALYTICS_KEY);
  const store: AnalyticsStore = result[ANALYTICS_KEY] ?? DEFAULT_STORE;
  store.installDate = new Date().toISOString();
  store.version = chrome.runtime.getManifest().version;
  await chrome.storage.local.set({ [ANALYTICS_KEY]: store });
  await trackEvent('install', { version: store.version });
}

export async function getAnalytics(): Promise<AnalyticsStore> {
  const result = await chrome.storage.local.get(ANALYTICS_KEY);
  return result[ANALYTICS_KEY] ?? DEFAULT_STORE;
}
