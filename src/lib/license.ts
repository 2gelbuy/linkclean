/**
 * Monetization is intentionally disabled while LinkClean builds audience.
 * Keep these helpers as no-op compatibility shims for older imports/tests.
 */

export function isProFilter(_filterKey: string): boolean {
  return false;
}

export async function isPro(): Promise<boolean> {
  return false;
}

export async function isFeatureUnlocked(_featureId: string): Promise<boolean> {
  return true;
}
