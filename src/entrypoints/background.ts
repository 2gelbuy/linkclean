import { trackEvent, trackInstall } from "@/lib/analytics";
import { getFilters, resetSessionCount } from "@/lib/filters";

const UNINSTALL_URL = "https://konabayev.com/linkclean/uninstall/";

export default defineBackground(() => {
  let sessionTotal = 0;

  chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === "install") {
      await trackInstall();
      chrome.runtime.setUninstallURL(UNINSTALL_URL);
    } else if (details.reason === "update") {
      await trackEvent("update", {
        from: details.previousVersion ?? "unknown",
        to: chrome.runtime.getManifest().version,
      });
      chrome.runtime.setUninstallURL(UNINSTALL_URL);
    }
  });

  // Listen for hidden post counts from content script
  chrome.runtime.onMessage.addListener(async (message) => {
    if (message.type === "linkclean:hidden") {
      sessionTotal += message.count;
      const filters = await getFilters();
      if (filters.showBadge) {
        const text = sessionTotal > 999 ? "999+" : String(sessionTotal);
        chrome.action.setBadgeText({ text });
        chrome.action.setBadgeBackgroundColor({ color: "#2563eb" });
      } else {
        chrome.action.setBadgeText({ text: "" });
      }
    }
  });

  // Clear badge & update when settings change
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.linkclean_filters) {
      const newFilters = changes.linkclean_filters.newValue;
      if (!newFilters?.showBadge) {
        chrome.action.setBadgeText({ text: "" });
      } else if (sessionTotal > 0) {
        const text = sessionTotal > 999 ? "999+" : String(sessionTotal);
        chrome.action.setBadgeText({ text });
        chrome.action.setBadgeBackgroundColor({ color: "#2563eb" });
      }
    }
  });

  // Reset session count on startup
  resetSessionCount();
});
