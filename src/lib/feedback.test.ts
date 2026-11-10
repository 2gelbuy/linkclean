import { afterEach, describe, expect, it, vi } from "vitest";
import { feedbackBrowser, localFeedbackReport } from "./feedback";
import type { FilterSettings } from "./filters";

afterEach(() => vi.unstubAllGlobals());

describe("local feedback diagnostics", () => {
  it("copies only the diagnostic allowlist, never page content or stored history", () => {
    const filters: FilterSettings & { history: string[] } = {
      enabled: true,
      hidePromoted: true,
      hideSuggested: false,
      hidePolls: false,
      hideReshares: false,
      hideVideoOnly: false,
      hideNewsletterAds: true,
      hideSidebarAds: true,
      showBadge: true,
      hiddenCount: 500,
      sessionHiddenCount: 20,
      history: ["private visited URL"],
    };
    const report = {
      status: "connected" as const,
      cardsFound: 12,
      cardsHidden: 2,
      url: "private feed URL",
      postText: "private post",
      profile: "private name",
    };
    const result = JSON.parse(
      localFeedbackReport("1.3.8", "Brave", report, filters),
    );
    expect(result).toEqual({
      schema: 1,
      version: "1.3.8",
      browser: "Brave",
      feed: { status: "connected", cardsFound: 12, cardsHidden: 2 },
      filters: {
        enabled: true,
        promoted: true,
        suggested: false,
        newsletter: true,
        sidebar: true,
        polls: false,
        reshares: false,
        video: false,
      },
    });
    expect(JSON.stringify(result)).not.toContain("private");
  });

  it("recognizes Brave without including its full user agent in a report", async () => {
    vi.stubGlobal("navigator", {
      userAgent: "Chrome/120.0 private-device",
      brave: { isBrave: async () => true },
    });
    expect(await feedbackBrowser()).toBe("Brave");
  });

  it("tolerates an unavailable optional browser API", async () => {
    vi.stubGlobal("navigator", {
      userAgent: "Chrome/120.0 Edg/120.0",
      brave: {
        isBrave: async () => {
          throw new Error("unavailable");
        },
      },
    });
    expect(await feedbackBrowser()).toBe("Edge");
  });
});
