import { describe, expect, it } from "vitest";

import { isProFilter } from "./license";

describe("isProFilter", () => {
  it("flags Pro-only filter keys", () => {
    expect(isProFilter("hidePolls")).toBe(true);
    expect(isProFilter("hideReshares")).toBe(true);
    expect(isProFilter("hideVideoOnly")).toBe(true);
    expect(isProFilter("hideSidebarAds")).toBe(true);
  });

  it("treats free filter keys as non-Pro", () => {
    expect(isProFilter("hidePromoted")).toBe(false);
    expect(isProFilter("hideSuggested")).toBe(false);
    expect(isProFilter("hideNewsletterAds")).toBe(false);
    expect(isProFilter("enabled")).toBe(false);
  });

  it("returns false for unknown keys", () => {
    expect(isProFilter("")).toBe(false);
    expect(isProFilter("totallyMadeUp")).toBe(false);
  });
});
