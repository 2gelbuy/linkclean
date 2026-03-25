/**
 * LinkClean — LinkedIn Feed Content Script
 *
 * Uses text-based detection (not CSS classes) because LinkedIn
 * uses hashed/obfuscated class names that change frequently.
 *
 * Strategy: find posts via <h2> headings containing "Публикация в ленте"
 * or "Feed post", then check innerText for signals like "Продвигается"/"Promoted".
 */

import { getFilters, incrementHiddenCount, type FilterSettings } from '@/lib/filters';

// Promoted keywords in all LinkedIn UI languages
const PROMOTED_KEYWORDS = [
  'promoted', 'продвигается', 'sponsorisé', 'gesponsert',
  'promovido', 'sponsorizzato', 'gepromoot', 'рекламна публікація',
  'promowane', 'sponsrad', 'sponsorlu', 'dipromosikan',
];

const SUGGESTED_KEYWORDS = [
  'suggested', 'рекомендуется', 'рекомендовано', 'suggéré',
  'vorgeschlagen', 'sugerido', 'suggerito', 'voorgesteld',
];

const NEWSLETTER_KEYWORDS = [
  'subscribe to this newsletter', 'подпишитесь на рассылку',
  'published a newsletter', 'опубликовал(а) рассылку',
  'see my newsletter', 'см. мою рассылку',
];

export default defineContentScript({
  matches: ['*://*.linkedin.com/*'],
  runAt: 'document_idle',

  async main() {
    let filters = await getFilters();
    let pendingCount = 0;
    let flushTimer: ReturnType<typeof setTimeout> | null = null;

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.linkclean_filters) {
        filters = changes.linkclean_filters.newValue;
        processAllPosts();
      }
    });

    /**
     * Find the post container from its h2 heading.
     * LinkedIn 2026 structure: h2 is inside a DIV (parent) inside another DIV (grandparent).
     * The grandparent DIV is the actual post container that should be hidden.
     * Fallback: walk up until we find an element with substantial innerText.
     */
    function getPostContainer(heading: Element): HTMLElement | null {
      // Try grandparent first (observed LinkedIn 2026 structure)
      const grandparent = heading.parentElement?.parentElement as HTMLElement | null;
      if (grandparent && grandparent.innerText && grandparent.innerText.length > 50) {
        return grandparent;
      }
      // Fallback: try closest li (older LinkedIn layout)
      const li = heading.closest('li') as HTMLElement | null;
      if (li) return li;
      // Last resort: parent
      return heading.parentElement as HTMLElement | null;
    }

    /**
     * Find all feed posts by looking for h2 headings.
     * Each feed post has an h2 with text like "Публикация в ленте" / "Feed post".
     */
    function findAllPosts(): HTMLElement[] {
      const headings = document.querySelectorAll('h2');
      const containers: HTMLElement[] = [];
      headings.forEach((h) => {
        const text = h.textContent?.toLowerCase() ?? '';
        if (text.includes('публикация') || text.includes('feed post') || text.includes('post in feed')) {
          const container = getPostContainer(h);
          if (container) containers.push(container);
        }
      });
      return containers;
    }

    function getPostText(post: HTMLElement): string {
      return (post.innerText ?? '').toLowerCase();
    }

    function isPromotedPost(text: string): boolean {
      return PROMOTED_KEYWORDS.some((kw) => text.includes(kw));
    }

    function isSuggestedPost(text: string): boolean {
      return SUGGESTED_KEYWORDS.some((kw) => text.includes(kw));
    }

    function isPollPost(post: HTMLElement): boolean {
      // Polls have radio buttons or specific poll UI
      return post.querySelector('[role="radio"], [role="radiogroup"]') !== null
        || post.innerHTML.includes('poll');
    }

    function isResharePost(text: string): boolean {
      // Reshares have "reposted" / "репостнул" / "поделился" pattern
      return /reposted|репостнул|поделил/i.test(text);
    }

    function isVideoOnlyPost(post: HTMLElement): boolean {
      const hasVideo = post.querySelector('video') !== null;
      if (!hasVideo) return false;
      // Check if there's substantial text content beyond the video
      const paragraphs = post.querySelectorAll('p');
      let textLength = 0;
      paragraphs.forEach((p) => {
        const t = p.textContent?.trim() ?? '';
        if (t.length > 5) textLength += t.length;
      });
      return textLength < 30;
    }

    function isNewsletterAd(text: string): boolean {
      return NEWSLETTER_KEYWORDS.some((kw) => text.includes(kw));
    }

    function shouldHidePost(post: HTMLElement, f: FilterSettings): boolean {
      if (!f.enabled) return false;
      const text = getPostText(post);
      if (f.hidePromoted && isPromotedPost(text)) return true;
      if (f.hideSuggested && isSuggestedPost(text)) return true;
      if (f.hideNewsletterAds && isNewsletterAd(text)) return true;
      if (f.hidePolls && isPollPost(post)) return true;
      if (f.hideReshares && isResharePost(text)) return true;
      if (f.hideVideoOnly && isVideoOnlyPost(post)) return true;
      return false;
    }

    function processPost(post: HTMLElement): void {
      if (post.getAttribute('data-linkclean-processed')) return;
      post.setAttribute('data-linkclean-processed', 'true');

      if (shouldHidePost(post, filters)) {
        post.style.display = 'none';
        post.setAttribute('data-linkclean-hidden', 'true');
        pendingCount++;
        scheduleFlush();
      }
    }

    function processAllPosts(): void {
      const posts = findAllPosts();
      for (const post of posts) {
        post.removeAttribute('data-linkclean-processed');
        const wasHidden = post.getAttribute('data-linkclean-hidden') === 'true';

        if (shouldHidePost(post, filters)) {
          post.style.display = 'none';
          post.setAttribute('data-linkclean-hidden', 'true');
          if (!wasHidden) {
            pendingCount++;
            scheduleFlush();
          }
        } else {
          post.style.display = '';
          post.removeAttribute('data-linkclean-hidden');
        }
        post.setAttribute('data-linkclean-processed', 'true');
      }
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
        chrome.runtime.sendMessage({ type: 'linkclean:hidden', count });
      } catch {
        // Background may not be active
      }
    }

    // MutationObserver — watch for new posts added to the feed
    const observer = new MutationObserver((mutations) => {
      let hasNewNodes = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          hasNewNodes = true;
          break;
        }
      }
      if (hasNewNodes) {
        // Debounce: process after DOM settles
        setTimeout(() => {
          const posts = findAllPosts();
          for (const post of posts) {
            if (!post.getAttribute('data-linkclean-processed')) {
              processPost(post);
            }
          }
        }, 200);
      }
    });

    const feedContainer = document.querySelector('main') ?? document.body;
    observer.observe(feedContainer, { childList: true, subtree: true });

    // Process existing posts
    processAllPosts();
  },
});
