/**
 * PostHog analytics for LinkClean popup.
 * Not loaded in content script (linkedin-feed.content.ts) — CSP + privacy concerns.
 * Respects user opt-out via chrome.storage.local[analytics_opt_out] = true.
 */
import posthog, { type PostHog } from "posthog-js";

const POSTHOG_KEY = import.meta.env.WXT_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST =
  (import.meta.env.WXT_POSTHOG_HOST as string | undefined) ??
  "https://us.i.posthog.com";
const OPT_OUT_KEY = "mirana_analytics_opt_out";

let initialized = false;
let optedOut = false;

async function loadOptOut(): Promise<boolean> {
  try {
    const r = await chrome.storage.local.get(OPT_OUT_KEY);
    return r[OPT_OUT_KEY] === true;
  } catch {
    return false;
  }
}

/** Initialize PostHog. Safe to call multiple times — only inits once. */
export async function initAnalytics(extensionName: string): Promise<void> {
  if (initialized || !POSTHOG_KEY) return;
  optedOut = await loadOptOut();
  if (optedOut) return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false,
    persistence: "localStorage",
    autocapture: false,
    disable_session_recording: true,
    loaded: (ph: PostHog) => {
      ph.register({
        extension_name: extensionName,
        extension_version: chrome.runtime.getManifest().version,
        runtime: "extension",
      });
    },
  });
  initialized = true;
}

/** Track a custom event. No-op if opted out or not initialized. */
export function track(event: string, props?: Record<string, unknown>): void {
  if (!initialized || optedOut) return;
  try {
    posthog.capture(event, props);
  } catch {
    // swallow — analytics must never break UX
  }
}

/** Identify user when they upgrade to paid (future Pro tier). Anonymous until called. */
export function identify(
  userId: string,
  props?: Record<string, unknown>,
): void {
  if (!initialized || optedOut) return;
  try {
    posthog.identify(userId, props);
  } catch {}
}

/** Set opt-out state. Stops further events + stores preference. */
export async function setOptOut(value: boolean): Promise<void> {
  optedOut = value;
  await chrome.storage.local.set({ [OPT_OUT_KEY]: value });
  if (value && initialized) {
    try {
      posthog.opt_out_capturing();
    } catch {}
  } else if (!value && initialized) {
    try {
      posthog.opt_in_capturing();
    } catch {}
  }
}

/** Current opt-out state. Useful for Settings UI. */
export async function isOptedOut(): Promise<boolean> {
  return await loadOptOut();
}
