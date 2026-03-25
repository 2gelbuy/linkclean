/**
 * Settings storage with cache invalidation.
 *
 * Usage:
 *   const settings = await getSettings();
 *   await updateSettings({ theme: 'dark' });
 *
 * Cache auto-invalidates via chrome.storage.onChanged.
 */

export interface ExtensionSettings {
  theme: 'light' | 'dark' | 'system';
  reviewDismissed: boolean;
  sessionCount: number;
  [key: string]: unknown;
}

const SETTINGS_KEY = 'mirana_settings';
const DEFAULTS: ExtensionSettings = {
  theme: 'system',
  reviewDismissed: false,
  sessionCount: 0,
};

let cache: ExtensionSettings | null = null;

// Invalidate cache on any storage change
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes[SETTINGS_KEY]) {
    cache = null;
  }
});

export async function getSettings(): Promise<ExtensionSettings> {
  if (cache) return cache;
  const result = await chrome.storage.sync.get(SETTINGS_KEY);
  const settings: ExtensionSettings = { ...DEFAULTS, ...(result[SETTINGS_KEY] ?? {}) };
  cache = settings;
  return settings;
}

export async function updateSettings(
  partial: Partial<ExtensionSettings>,
): Promise<ExtensionSettings> {
  const current = await getSettings();
  const updated = { ...current, ...partial };
  await chrome.storage.sync.set({ [SETTINGS_KEY]: updated });
  cache = updated;
  return updated;
}

/**
 * Increment session count. Call on popup open.
 * Used for review prompt logic (show after 5+ sessions).
 */
export async function trackSession(): Promise<number> {
  const settings = await getSettings();
  const newCount = settings.sessionCount + 1;
  await updateSettings({ sessionCount: newCount });
  return newCount;
}
