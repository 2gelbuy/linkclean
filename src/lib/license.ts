/**
 * Freemium license management via LemonSqueezy.
 *
 * Flow:
 * 1. User clicks "Upgrade" in extension popup
 * 2. Opens LemonSqueezy checkout overlay (or URL)
 * 3. On success, license key stored in chrome.storage.sync
 * 4. Features gated via `isPro()` check
 *
 * No server needed — validation via LemonSqueezy API directly.
 */

/**
 * LemonSqueezy checkout URL for LinkClean Pro ($4.99/mo).
 * TODO: Replace with actual LemonSqueezy checkout URL after creating product.
 */
export const CHECKOUT_URL = 'https://konabayev.com/linkclean/#pro';

/**
 * Filter keys that require Pro to enable.
 */
const PRO_FILTERS = new Set([
  'hidePolls',
  'hideReshares',
  'hideVideoOnly',
  'hideSidebarAds',
]);

/**
 * Returns true if the given filter key requires a Pro license.
 */
export function isProFilter(filterKey: string): boolean {
  return PRO_FILTERS.has(filterKey);
}

const STORAGE_KEY = 'mirana_license';

export interface LicenseState {
  key: string | null;
  valid: boolean;
  email: string | null;
  activatedAt: string | null;
}

const DEFAULT_STATE: LicenseState = {
  key: null,
  valid: false,
  email: null,
  activatedAt: null,
};

export async function getLicenseState(): Promise<LicenseState> {
  const result = await chrome.storage.sync.get(STORAGE_KEY);
  return result[STORAGE_KEY] ?? DEFAULT_STATE;
}

export async function isPro(): Promise<boolean> {
  const state = await getLicenseState();
  return state.valid;
}

export async function activateLicense(key: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('https://api.lemonsqueezy.com/v1/licenses/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        license_key: key,
        instance_name: chrome.runtime.id,
      }),
    });

    const data = await res.json();

    if (!data.activated && !data.valid) {
      return { ok: false, error: data.error ?? 'Invalid license key' };
    }

    const state: LicenseState = {
      key,
      valid: true,
      email: data.meta?.customer_email ?? null,
      activatedAt: new Date().toISOString(),
    };

    await chrome.storage.sync.set({ [STORAGE_KEY]: state });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

export async function deactivateLicense(): Promise<void> {
  await chrome.storage.sync.remove(STORAGE_KEY);
}

/**
 * Feature gate helper.
 * Usage: if (await isFeatureUnlocked('advanced-export')) { ... }
 *
 * Define your gated features in FREE_FEATURES / PRO_FEATURES arrays.
 */
const FREE_FEATURES = new Set([
  // Add free feature IDs here
  'basic-feature',
]);

export async function isFeatureUnlocked(featureId: string): Promise<boolean> {
  if (FREE_FEATURES.has(featureId)) return true;
  return isPro();
}
