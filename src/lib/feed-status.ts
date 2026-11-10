export type FeedStatus =
  | "connected"
  | "other-page"
  | "reload-needed"
  | "no-site-access";

// The feed lives on www.linkedin.com; checking that exact origin also covers
// a partial grant that leaves the wildcard pattern unsatisfied.
const LINKEDIN_ORIGINS = ["https://www.linkedin.com/*"];

/** No reply can mean: not a LinkedIn tab, a LinkedIn tab opened before
 * install/update, or site access withheld. The extension cannot see the tab
 * URL, so only the last case can be told apart, through the permissions API. */
async function notConnected(): Promise<FeedReport> {
  try {
    const granted = await chrome.permissions?.contains({
      origins: LINKEDIN_ORIGINS,
    });
    if (granted === false) return { status: "no-site-access" };
  } catch {
    // Unknown access state: fall back to the generic message.
  }
  return { status: "reload-needed" };
}

export interface FeedReport {
  status: FeedStatus;
  cardsFound?: number;
  cardsHidden?: number;
}

function count(value: unknown): number | undefined {
  return typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 10000
    ? value
    : undefined;
}

/** A reply from the active tab proves that filtering is actually available.
 * Tab IDs and messaging need no new browser permission or browsing history. */
export async function getActiveFeedStatus(): Promise<FeedStatus> {
  return (await getActiveFeedReport()).status;
}

export async function getActiveFeedReport(): Promise<FeedReport> {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.id === undefined) return notConnected();
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "linkclean:status",
    });
    if (response?.type !== "linkclean:status") return notConnected();
    return {
      status: response.onFeed === true ? "connected" : "other-page",
      cardsFound: count(response.cardsFound),
      cardsHidden: count(response.cardsHidden),
    };
  } catch {
    // Do not claim filtering is running.
    return notConnected();
  }
}
