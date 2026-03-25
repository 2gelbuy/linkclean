/**
 * LinkedIn feed filter settings.
 * Stored in chrome.storage.local for fast access from content script.
 */

export interface FilterSettings {
  enabled: boolean;
  hidePromoted: boolean;
  hideSuggested: boolean;
  hidePolls: boolean;
  hideReshares: boolean;
  hideVideoOnly: boolean;
  hideNewsletterAds: boolean;
  hiddenCount: number;
  sessionHiddenCount: number;
}

const FILTERS_KEY = 'linkclean_filters';

export const DEFAULT_FILTERS: FilterSettings = {
  enabled: true,
  hidePromoted: true,
  hideSuggested: true,
  hidePolls: false,
  hideReshares: false,
  hideVideoOnly: false,
  hideNewsletterAds: true,
  hiddenCount: 0,
  sessionHiddenCount: 0,
};

let cache: FilterSettings | null = null;

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes[FILTERS_KEY]) {
    cache = changes[FILTERS_KEY].newValue ?? null;
  }
});

export async function getFilters(): Promise<FilterSettings> {
  if (cache) return cache;
  const result = await chrome.storage.local.get(FILTERS_KEY);
  const filters: FilterSettings = { ...DEFAULT_FILTERS, ...(result[FILTERS_KEY] ?? {}) };
  cache = filters;
  return filters;
}

export async function updateFilters(
  partial: Partial<FilterSettings>,
): Promise<FilterSettings> {
  const current = await getFilters();
  const updated = { ...current, ...partial };
  await chrome.storage.local.set({ [FILTERS_KEY]: updated });
  cache = updated;
  return updated;
}

export async function incrementHiddenCount(count: number): Promise<void> {
  const current = await getFilters();
  await updateFilters({
    hiddenCount: current.hiddenCount + count,
    sessionHiddenCount: current.sessionHiddenCount + count,
  });
}

export async function resetSessionCount(): Promise<void> {
  await updateFilters({ sessionHiddenCount: 0 });
}
