export type FeedStatus = "connected" | "other-page" | "reload-needed";

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
    if (tab?.id === undefined) return { status: "reload-needed" };
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "linkclean:status",
    });
    if (response?.type !== "linkclean:status")
      return { status: "reload-needed" };
    return {
      status: response.onFeed === true ? "connected" : "other-page",
      cardsFound: count(response.cardsFound),
      cardsHidden: count(response.cardsHidden),
    };
  } catch {
    // An already-open LinkedIn tab may predate installation/update, or the
    // browser may withhold site access. Do not claim filtering is running.
    return { status: "reload-needed" };
  }
}
