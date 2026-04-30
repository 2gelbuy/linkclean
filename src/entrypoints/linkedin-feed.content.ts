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

export default defineContentScript({
  matches: ["*://*.linkedin.com/*"],
  runAt: "document_idle",

  async main() {
    let filters = await getFilters();
    let pendingCount = 0;
    let flushTimer: ReturnType<typeof setTimeout> | null = null;
    let processTimer: ReturnType<typeof setTimeout> | null = null;
    let currentPathname = window.location.pathname;

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes.linkclean_filters) {
        filters = changes.linkclean_filters.newValue;
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

      element.setAttribute(PREVIOUS_DISPLAY_ATTR, element.style.display);
      element.style.display = "none";
      element.setAttribute(attr, "true");
      return true;
    }

    function restoreManagedElement(element: HTMLElement, attr: string): void {
      if (element.getAttribute(attr) !== "true") return;

      const previousDisplay = element.getAttribute(PREVIOUS_DISPLAY_ATTR) ?? "";
      if (previousDisplay) {
        element.style.display = previousDisplay;
      } else {
        element.style.removeProperty("display");
      }
      element.removeAttribute(attr);
      element.removeAttribute(PREVIOUS_DISPLAY_ATTR);
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

    function scheduleProcessAll(): void {
      if (processTimer) clearTimeout(processTimer);
      processTimer = setTimeout(() => {
        processAllPosts();
        hideSidebarAds();
        processTimer = null;
      }, 250);
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

    // MutationObserver — watch for new posts added to the feed
    const observer = new MutationObserver((mutations) => {
      let hasNewNodes = false;
      const pathnameChanged = currentPathname !== window.location.pathname;
      if (pathnameChanged) {
        currentPathname = window.location.pathname;
      }

      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          hasNewNodes = true;
          break;
        }
      }
      if (hasNewNodes || pathnameChanged) {
        scheduleProcessAll();
      }
    });

    // Observe the entire body to catch both feed posts and lazy-loaded sidebar ads
    observer.observe(document.body, { childList: true, subtree: true });

    // Process existing posts + sidebar
    processAllPosts();
    hideSidebarAds();
  },
});
