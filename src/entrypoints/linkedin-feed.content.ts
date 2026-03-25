/**
 * LinkClean — LinkedIn Feed Content Script
 *
 * Detects and hides unwanted posts from LinkedIn feed:
 * - Promoted (sponsored) posts
 * - Suggested posts
 * - Polls (optional)
 * - Reshares (optional)
 * - Video-only posts (optional)
 * - Newsletter promotion ads (optional)
 *
 * Uses MutationObserver for dynamic content.
 * All processing is local — no data leaves the browser.
 */

import { getFilters, incrementHiddenCount, type FilterSettings } from '@/lib/filters';

export default defineContentScript({
  matches: ['*://*.linkedin.com/*'],
  runAt: 'document_idle',

  async main() {
    let filters = await getFilters();
    let pendingCount = 0;
    let flushTimer: ReturnType<typeof setTimeout> | null = null;

    // Listen for settings changes from popup
    chrome.storage.onChanged.addListener(async (changes, area) => {
      if (area === 'local' && changes.linkclean_filters) {
        filters = changes.linkclean_filters.newValue;
        // Re-process visible posts when settings change
        processAllPosts();
      }
    });

    function isPromotedPost(post: Element): boolean {
      // LinkedIn marks promoted posts with "Promoted" or localized text
      // Usually in a <span> near the actor info
      const promotedSpan = post.querySelector(
        'span.update-components-actor__sub-description-link span[aria-hidden="true"]'
      );
      if (promotedSpan?.textContent?.trim().toLowerCase() === 'promoted') return true;

      // Alternative selector: the "Promoted" label in feed
      const altPromoted = post.querySelector('.feed-shared-actor__sub-description');
      if (altPromoted?.textContent?.toLowerCase().includes('promoted')) return true;

      // Check for "Sponsored" text anywhere in actor area
      const actorArea = post.querySelector('.update-components-actor');
      if (actorArea?.textContent?.toLowerCase().includes('promoted')) return true;
      if (actorArea?.textContent?.toLowerCase().includes('sponsored')) return true;

      return false;
    }

    function isSuggestedPost(post: Element): boolean {
      // "Suggested" appears in the feed-shared-header or update-components-header
      const header = post.querySelector(
        '.update-components-header__text-view, .feed-shared-header__text'
      );
      if (header?.textContent?.toLowerCase().includes('suggested')) return true;

      // Also check for "Suggested for you" badge
      const badge = post.querySelector('[data-urn]');
      const parentText = badge?.closest('.feed-shared-update-v2')
        ?.querySelector('.update-components-header');
      if (parentText?.textContent?.toLowerCase().includes('suggested')) return true;

      return false;
    }

    function isPollPost(post: Element): boolean {
      return post.querySelector('.feed-shared-poll') !== null
        || post.querySelector('.update-components-poll') !== null;
    }

    function isResharePost(post: Element): boolean {
      return post.querySelector('.feed-shared-mini-update-v2') !== null
        || post.querySelector('.update-components-mini-update-v2') !== null;
    }

    function isVideoOnlyPost(post: Element): boolean {
      const hasVideo = post.querySelector(
        '.feed-shared-linkedin-video, .update-components-linkedin-video, video'
      ) !== null;
      const hasText = post.querySelector(
        '.feed-shared-text, .update-components-text'
      );
      const textContent = hasText?.textContent?.trim() ?? '';
      // Video-only = has video but minimal text (< 20 chars)
      return hasVideo && textContent.length < 20;
    }

    function isNewsletterAd(post: Element): boolean {
      const text = post.textContent?.toLowerCase() ?? '';
      return text.includes('subscribe to this newsletter')
        || text.includes('published a newsletter')
        || post.querySelector('.feed-shared-article__subtitle--newsletter') !== null;
    }

    function shouldHidePost(post: Element, f: FilterSettings): boolean {
      if (!f.enabled) return false;
      if (f.hidePromoted && isPromotedPost(post)) return true;
      if (f.hideSuggested && isSuggestedPost(post)) return true;
      if (f.hidePolls && isPollPost(post)) return true;
      if (f.hideReshares && isResharePost(post)) return true;
      if (f.hideVideoOnly && isVideoOnlyPost(post)) return true;
      if (f.hideNewsletterAds && isNewsletterAd(post)) return true;
      return false;
    }

    function processPost(post: Element): void {
      if (post.getAttribute('data-linkclean-processed')) return;
      post.setAttribute('data-linkclean-processed', 'true');

      if (shouldHidePost(post, filters)) {
        (post as HTMLElement).style.display = 'none';
        post.setAttribute('data-linkclean-hidden', 'true');
        pendingCount++;
        scheduleFlush();
      }
    }

    function processAllPosts(): void {
      const posts = document.querySelectorAll(
        '.feed-shared-update-v2, .occludable-update'
      );
      posts.forEach((post) => {
        // Reset processed state on re-process
        post.removeAttribute('data-linkclean-processed');
        const wasHidden = post.getAttribute('data-linkclean-hidden') === 'true';

        if (shouldHidePost(post, filters)) {
          (post as HTMLElement).style.display = 'none';
          post.setAttribute('data-linkclean-hidden', 'true');
          if (!wasHidden) {
            pendingCount++;
            scheduleFlush();
          }
        } else {
          (post as HTMLElement).style.display = '';
          post.removeAttribute('data-linkclean-hidden');
        }
        post.setAttribute('data-linkclean-processed', 'true');
      });
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
        chrome.runtime.sendMessage({
          type: 'linkclean:hidden',
          count,
        });
      } catch {
        // Background may not be active
      }
    }

    // MutationObserver for dynamic feed loading
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;

          // Check if the added node is a feed post
          if (
            node.classList.contains('feed-shared-update-v2') ||
            node.classList.contains('occludable-update')
          ) {
            processPost(node);
          }

          // Check descendants
          const posts = node.querySelectorAll?.(
            '.feed-shared-update-v2, .occludable-update'
          );
          posts?.forEach(processPost);
        }
      }
    });

    // Start observing
    const feedContainer = document.querySelector('.scaffold-finite-scroll__content')
      ?? document.querySelector('main')
      ?? document.body;

    observer.observe(feedContainer, {
      childList: true,
      subtree: true,
    });

    // Process existing posts
    processAllPosts();
  },
});
