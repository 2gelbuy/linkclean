import { describe, expect, it } from "vitest";

import { isFeatureUnlocked, isPro, isProFilter } from "./license";

describe("isProFilter", () => {
  it("treats every filter as free while audience growth comes first", () => {
    expect(isProFilter("hidePromoted")).toBe(false);
    expect(isProFilter("hideSuggested")).toBe(false);
    expect(isProFilter("hideNewsletterAds")).toBe(false);
    expect(isProFilter("hideSidebarAds")).toBe(false);
    expect(isProFilter("hidePolls")).toBe(false);
    expect(isProFilter("hideReshares")).toBe(false);
    expect(isProFilter("hideVideoOnly")).toBe(false);
    expect(isProFilter("enabled")).toBe(false);
  });

  it("returns false for unknown keys", () => {
    expect(isProFilter("")).toBe(false);
    expect(isProFilter("totallyMadeUp")).toBe(false);
  });

  it("does not expose paid state or locked features", async () => {
    await expect(isPro()).resolves.toBe(false);
    await expect(isFeatureUnlocked("hidePolls")).resolves.toBe(true);
  });
});
