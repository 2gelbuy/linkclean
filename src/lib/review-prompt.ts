import type { FeedReport } from "./feed-status";

export const MIN_SESSIONS_FOR_REVIEW = 3;

/** Ask only people who just saw LinkClean work: the feed is connected,
 * filtering is on and at least one card was hidden on this page. */
export function shouldAskForReview(input: {
  sessionCount: number;
  dismissed: boolean;
  filteringEnabled: boolean;
  report: FeedReport | null;
}): boolean {
  const { sessionCount, dismissed, filteringEnabled, report } = input;
  return (
    !dismissed &&
    filteringEnabled &&
    sessionCount >= MIN_SESSIONS_FOR_REVIEW &&
    report?.status === "connected" &&
    (report.cardsHidden ?? 0) > 0
  );
}

const REVIEW_URLS = {
  chrome:
    "https://chromewebstore.google.com/detail/linkclean/ipdckibncofmlnoaajkdhnbclbpgppdg/reviews",
  edge: "https://microsoftedge.microsoft.com/addons/detail/linkclean/bblfppgmemclkljnffgbeklcbmfbgdle",
  firefox:
    "https://addons.mozilla.org/firefox/addon/linkclean-linkedin-feed-cleane/reviews/",
} as const;

/** Send people to the store they installed from. */
export function reviewUrlFor(userAgent: string): string {
  if (/Firefox\//.test(userAgent)) return REVIEW_URLS.firefox;
  if (/Edg\//.test(userAgent)) return REVIEW_URLS.edge;
  return REVIEW_URLS.chrome;
}
