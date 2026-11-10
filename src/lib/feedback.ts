import type { FilterSettings } from "./filters";
import type { FeedReport } from "./feed-status";

export async function feedbackBrowser(): Promise<string> {
  const nav = navigator as Navigator & {
    brave?: { isBrave(): Promise<boolean> };
  };
  try {
    if (await nav.brave?.isBrave()) return "Brave";
  } catch {
    /* optional browser API */
  }
  const ua = navigator.userAgent;
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\//.test(ua)) return "Opera";
  if (/Chrome\//.test(ua)) return "Chrome";
  return "Other";
}

/** Local preview/copy only. Never put this report in a URL or send it. */
export function localFeedbackReport(
  version: string,
  browser: string,
  report: FeedReport,
  filters: FilterSettings,
): string {
  return JSON.stringify(
    {
      schema: 1,
      version,
      browser,
      feed: {
        status: report.status,
        cardsFound: report.cardsFound,
        cardsHidden: report.cardsHidden,
      },
      filters: {
        enabled: filters.enabled,
        promoted: filters.hidePromoted,
        suggested: filters.hideSuggested,
        newsletter: filters.hideNewsletterAds,
        sidebar: filters.hideSidebarAds,
        polls: filters.hidePolls,
        reshares: filters.hideReshares,
        video: filters.hideVideoOnly,
      },
    },
    null,
    2,
  );
}
