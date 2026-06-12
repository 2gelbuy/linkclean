/**
 * LinkClean — LinkedIn Feed Content Script
 *
 * Uses text-based detection (not CSS classes) because LinkedIn
 * uses hashed/obfuscated class names that change frequently.
 *
 * Strategy: find semantic feed post containers, then check compact labels
 * and accessibility attributes for ad/suggested/newsletter signals.
 */

import {
  getFilters,
  incrementHiddenCount,
  type FilterSettings,
} from "@/lib/filters";
import {
  findLinkedInFeedPosts,
  isLinkedInFeedSurface,
  isPromotedSidebarLabel,
  isPromotionalSidebarWidget,
  shouldHideLinkedInPost,
} from "@/lib/linkedin-detector";

const POST_HIDDEN_ATTR = "data-linkclean-hidden";
const SIDEBAR_HIDDEN_ATTR = "data-linkclean-sidebar";
const PREVIOUS_DISPLAY_ATTR = "data-linkclean-previous-display";
const HIDE_STYLE_ID = "linkclean-hide-style";

const OBSERVED_ATTRIBUTES = [
  "aria-label",
  "aria-describedby",
  "title",
  "alt",
  "data-test-id",
  "data-promoted-tracking-control-name",
  "data-sponsored-tracking-url",
  "data-view-tracking-scope",
  "data-finite-scroll-hotkey-item",
  "data-urn",
  "data-id",
  "componentkey",
];

/**
 * Hide via stylesheet keyed on our marker attribute, not inline styles.
 * LinkedIn re-renders overwrite element.style and would un-hide posts while
 * the marker attribute survives — the CSS rule keeps them hidden.
 *
 * When the promoted filter is active on the feed, also pre-hide elements
 * carrying LinkedIn's own sponsored markers so ads never paint at all
 * (no visible-then-hidden flash while the JS pass catches up).
 */
function buildHideStyleContent(
  filters: FilterSettings,
  onFeedSurface: boolean,
): string {
  const rules = [
    `[${POST_HIDDEN_ATTR}="true"], [${SIDEBAR_HIDDEN_ATTR}="true"] { display: none !important; }`,
  ];

  if (onFeedSurface && filters.enabled && filters.hidePromoted) {
    rules.push(
      "main article[data-sponsored-tracking-url], " +
        "main [data-urn*='promoted'], " +
        "main [data-id*='promoted'] { display: none !important; }",
    );
  }

  return rules.join("\n");
}

function ensureHideStyle(content: string): void {
  let style = document.getElementById(HIDE_STYLE_ID) as HTMLStyleElement | null;
  if (!style || !style.isConnected) {
    style = document.createElement("style");
    style.id = HIDE_STYLE_ID;
    (document.head ?? document.documentElement).appendChild(style);
  }
  if (style.textContent !== content) {
    style.textContent = content;
  }
}

export default defineContentScript({
  matches: ["*://*.linkedin.com/*"],
  runAt: "document_idle",

  async main() {
    let filters = await getFilters();
    let pendingCount = 0;
    let flushTimer: ReturnType<typeof setTimeout> | null = null;
    let processTimer: ReturnType<typeof setTimeout> | null = null;
    let lastProcessedAt = 0;
    let currentPathname = window.location.pathname;

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes.linkclean_filters) {
        filters = changes.linkclean_filters.newValue ?? filters;
        scheduleProcessAll();
      }
    });

    function isActiveFeedSurface(): boolean {
      return isLinkedInFeedSurface(window.location.pathname);
    }

    function findAllPosts(): HTMLElement[] {
      return findLinkedInFeedPosts(document);
    }

    function shouldHidePost(post: HTMLElement, f: FilterSettings): boolean {
      return shouldHideLinkedInPost(post, f);
    }

    function hideManagedElement(element: HTMLElement, attr: string): boolean {
      if (element.getAttribute(attr) === "true") return false;

      element.setAttribute(attr, "true");
      return true;
    }

    function restoreManagedElement(element: HTMLElement, attr: string): void {
      if (element.getAttribute(attr) !== "true") return;

      element.removeAttribute(attr);

      // Cleanup for elements hidden by older LinkClean versions that used
      // inline display styles.
      const previousDisplay = element.getAttribute(PREVIOUS_DISPLAY_ATTR);
      if (previousDisplay !== null) {
        if (previousDisplay) {
          element.style.display = previousDisplay;
        } else {
          element.style.removeProperty("display");
        }
        element.removeAttribute(PREVIOUS_DISPLAY_ATTR);
      }
    }

    function restoreAllManagedElements(): void {
      document.querySelectorAll(`[${POST_HIDDEN_ATTR}]`).forEach((node) => {
        restoreManagedElement(node as HTMLElement, POST_HIDDEN_ATTR);
      });
      document.querySelectorAll(`[${SIDEBAR_HIDDEN_ATTR}]`).forEach((node) => {
        restoreManagedElement(node as HTMLElement, SIDEBAR_HIDDEN_ATTR);
      });
    }

    function processAllPosts(): void {
      if (!isActiveFeedSurface()) {
        restoreAllManagedElements();
        return;
      }

      const posts = findAllPosts();
      for (const post of posts) {
        post.removeAttribute("data-linkclean-processed");

        if (shouldHidePost(post, filters)) {
          if (hideManagedElement(post, POST_HIDDEN_ATTR)) {
            pendingCount++;
            scheduleFlush();
          }
        } else {
          restoreManagedElement(post, POST_HIDDEN_ATTR);
        }
        post.setAttribute("data-linkclean-processed", "true");
      }
    }

    function runProcessPass(): void {
      lastProcessedAt = Date.now();
      ensureHideStyle(buildHideStyleContent(filters, isActiveFeedSurface()));
      processAllPosts();
      hideSidebarAds();
    }

    function scheduleProcessAll(): void {
      // Leading+trailing throttle, not debounce: LinkedIn's feed mutates
      // continuously while scrolling, and a resetting debounce would starve
      // processing. After a quiet period the first batch runs immediately.
      if (processTimer) return;
      const delay = Date.now() - lastProcessedAt > 600 ? 0 : 250;
      processTimer = setTimeout(() => {
        processTimer = null;
        runProcessPass();
      }, delay);
    }

    function scheduleFlush(): void {
      if (flushTimer) return;
      flushTimer = setTimeout(() => {
        if (pendingCount > 0) {
          incrementHiddenCount(pendingCount);
          updateBadge(pendingCount);
          pendingCount = 0;
        }
        flushTimer = null;
      }, 1000);
    }

    function updateBadge(count: number): void {
      try {
        chrome.runtime.sendMessage({ type: "linkclean:hidden", count });
      } catch {
        // Background may not be active
      }
    }

    function isRightRailElement(element: HTMLElement): boolean {
      const rect = element.getBoundingClientRect();
      if (rect.width < 120 || rect.height < 60) return false;

      const mainFeedRect = document
        .querySelector("main")
        ?.getBoundingClientRect();
      const rightRailStart = mainFeedRect
        ? mainFeedRect.left + mainFeedRect.width * 0.6
        : window.innerWidth * 0.55;

      return rect.left >= rightRailStart;
    }

    function restoreSidebarElements(options: { rightRailOnly: boolean }): void {
      document.querySelectorAll(`[${SIDEBAR_HIDDEN_ATTR}]`).forEach((node) => {
        const element = node as HTMLElement;
        if (options.rightRailOnly && isRightRailElement(element)) return;
        restoreManagedElement(element, SIDEBAR_HIDDEN_ATTR);
      });
    }

    /**
     * Hide promoted widgets in the right sidebar.
     * These are ad blocks with "Promoted" / "Реклама" text outside the main feed.
     * Searches the entire page but skips the main feed area (handled by feed filters).
     */
    function hideSidebarAds(): void {
      if (
        !isActiveFeedSurface() ||
        !filters.enabled ||
        !filters.hideSidebarAds
      ) {
        restoreSidebarElements({ rightRailOnly: false });
        return;
      }

      const mainFeed = document.querySelector("main");
      const sidebarCandidates = document.querySelectorAll(
        "aside section, aside div, [class*='right'] section, [class*='right'] div, [class*='rail'] section, [class*='rail'] div",
      );
      const spans = document.querySelectorAll("span");

      for (const candidate of sidebarCandidates) {
        if (mainFeed && mainFeed.contains(candidate)) continue;
        const element = candidate as HTMLElement;
        if (
          element.closest(`[${SIDEBAR_HIDDEN_ATTR}]`) ||
          element.id === "global-nav"
        ) {
          continue;
        }

        if (!isRightRailElement(element)) continue;

        if (isPromotionalSidebarWidget(element)) {
          if (hideManagedElement(element, SIDEBAR_HIDDEN_ATTR)) {
            pendingCount++;
            scheduleFlush();
          }
        }
      }

      for (const span of spans) {
        // Skip spans inside the main feed — those are handled by feed filters
        if (mainFeed && mainFeed.contains(span)) continue;
        // Skip already-processed sidebar elements
        if ((span as HTMLElement).closest(`[${SIDEBAR_HIDDEN_ATTR}]`)) continue;

        const text = (span.textContent ?? "").toLowerCase().trim();
        // Match short text that equals or starts with a promoted keyword
        // (avoids matching "promoted" inside long paragraphs)
        if (isPromotedSidebarLabel(text)) {
          // Walk up to find the ad container — stop at a reasonable boundary
          let container: HTMLElement | null = span as HTMLElement;
          for (let i = 0; i < 10; i++) {
            const parent: HTMLElement | null = container?.parentElement ?? null;
            if (
              !parent ||
              parent.tagName === "BODY" ||
              parent.tagName === "ASIDE" ||
              parent.id === "global-nav"
            )
              break;
            container = parent;
            // Stop if container is large enough to be the ad widget
            if (container!.offsetHeight > 100 && container!.offsetWidth > 100)
              break;
          }
          if (
            container &&
            !container.getAttribute(SIDEBAR_HIDDEN_ATTR) &&
            isRightRailElement(container)
          ) {
            if (hideManagedElement(container, SIDEBAR_HIDDEN_ATTR)) {
              pendingCount++;
              scheduleFlush();
            }
          }
        }
      }
    }

    function shouldProcessMutation(mutation: MutationRecord): boolean {
      if (mutation.type === "childList") {
        return mutation.addedNodes.length > 0;
      }

      if (mutation.type === "characterData") {
        return true;
      }

      if (mutation.type === "attributes") {
        return OBSERVED_ATTRIBUTES.includes(mutation.attributeName ?? "");
      }

      return false;
    }

    // MutationObserver — watch for new posts and lazy-loaded ad labels
    const observer = new MutationObserver((mutations) => {
      let hasNewNodes = false;
      const pathnameChanged = currentPathname !== window.location.pathname;
      if (pathnameChanged) {
        currentPathname = window.location.pathname;
      }

      for (const mutation of mutations) {
        if (shouldProcessMutation(mutation)) {
          hasNewNodes = true;
          break;
        }
      }
      if (hasNewNodes || pathnameChanged) {
        scheduleProcessAll();
      }
    });

    // Observe the entire body to catch both feed posts and lazy-loaded sidebar ads
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: OBSERVED_ATTRIBUTES,
    });

    // Process existing posts + sidebar
    runProcessPass();
  },
});
