import { describe, expect, it } from "vitest";
import { reviewUrlFor, shouldAskForReview } from "./review-prompt";

const base = {
  sessionCount: 3,
  dismissed: false,
  filteringEnabled: true,
  report: { status: "connected" as const, cardsFound: 20, cardsHidden: 4 },
};

describe("review prompt", () => {
  it("asks after a session in which LinkClean hid something", () => {
    expect(shouldAskForReview(base)).toBe(true);
  });

  it("does not ask when the user has not just seen it work", () => {
    expect(shouldAskForReview({ ...base, sessionCount: 2 })).toBe(false);
    expect(shouldAskForReview({ ...base, dismissed: true })).toBe(false);
    expect(shouldAskForReview({ ...base, filteringEnabled: false })).toBe(
      false,
    );
    expect(shouldAskForReview({ ...base, report: null })).toBe(false);
    expect(
      shouldAskForReview({ ...base, report: { status: "reload-needed" } }),
    ).toBe(false);
    expect(
      shouldAskForReview({ ...base, report: { status: "other-page" } }),
    ).toBe(false);
    expect(
      shouldAskForReview({
        ...base,
        report: { status: "connected", cardsHidden: 0 },
      }),
    ).toBe(false);
    expect(
      shouldAskForReview({ ...base, report: { status: "connected" } }),
    ).toBe(false);
  });

  it("links to the store of the current browser", () => {
    expect(reviewUrlFor("Mozilla/5.0 Firefox/130.0")).toContain(
      "addons.mozilla.org",
    );
    expect(
      reviewUrlFor("Mozilla/5.0 Chrome/131.0 Safari/537.36 Edg/131.0"),
    ).toContain("microsoftedge.microsoft.com");
    expect(reviewUrlFor("Mozilla/5.0 Chrome/131.0 Safari/537.36")).toContain(
      "chromewebstore.google.com",
    );
  });
});
