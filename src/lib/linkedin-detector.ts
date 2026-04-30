import type { FilterSettings } from "@/lib/filters";

const POST_HEADING_KEYWORDS = [
  "feed post",
  "post in feed",
  "публикация",
  "пост в ленте",
];

const POST_CONTAINER_SELECTORS = [
  "article",
  "[role='article']",
  "[data-urn^='urn:li:activity:']",
  "[data-urn^='urn:li:share:']",
  "[data-id^='urn:li:activity:']",
  "[data-id^='urn:li:share:']",
  ".feed-shared-update-v2",
];

const POST_IDENTITY_SELECTORS = [
  "[data-urn^='urn:li:activity:']",
  "[data-urn^='urn:li:share:']",
  "[data-id^='urn:li:activity:']",
  "[data-id^='urn:li:share:']",
  ".feed-shared-update-v2",
];

const PROMOTED_LABEL_KEYWORDS = [
  "promoted",
  "sponsored",
  "sponsor",
  "ad",
  "advertisement",
  "paid partnership",
  "продвигается",
  "реклама",
  "рекламная публикация",
  "рекламна публікація",
  "sponsorisé",
  "sponsorisée",
  "gesponsert",
  "anzeige",
  "promovido",
  "patrocinado",
  "sponsorizzato",
  "gepromoot",
  "advertentie",
  "promowane",
  "sponsorowane",
  "sponsrad",
  "sponsorlu",
  "dipromosikan",
];

const SUGGESTED_KEYWORDS = [
  "suggested",
  "рекомендуется",
  "рекомендовано",
  "suggéré",
  "vorgeschlagen",
  "sugerido",
  "suggerito",
  "voorgesteld",
];

const NEWSLETTER_KEYWORDS = [
  "subscribe to this newsletter",
  "подпишитесь на рассылку",
  "published a newsletter",
  "опубликовал(а) рассылку",
  "see my newsletter",
  "см. мою рассылку",
];

const SIDEBAR_PROMO_PHRASES = [
  "your job search powered by your network",
  "explore jobs",
  "try premium page",
  "advertise on linkedin",
  "ad choices",
  "promoted",
  "sponsored",
  "реклама",
];

function getElementText(element: Element): string {
  const htmlElement = element as HTMLElement;
  return (htmlElement.innerText || element.textContent || "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[·•|]/g, " ").replace(/\s+/g, " ").trim();
}

function hasPostHeading(element: Element): boolean {
  return Array.from(element.querySelectorAll("h2")).some((heading) => {
    const text = normalizeText(getElementText(heading));
    return POST_HEADING_KEYWORDS.some((keyword) => text.includes(keyword));
  });
}

export function isLinkedInFeedSurface(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, "") || "/";
  return path === "/feed";
}

function isInsideLinkedInChrome(element: HTMLElement): boolean {
  return (
    element.closest(
      "aside, nav, header, footer, #global-nav, [role='navigation'], [data-test-global-nav]",
    ) !== null
  );
}

function hasSocialActionControls(element: Element): boolean {
  const actionPattern =
    /^(like|comment|repost|share|send|react|open reactions|нравится|коммент|репост|отправить)\b/i;

  return (
    Array.from(element.querySelectorAll("button[aria-label], a[aria-label]"))
      .map((node) => node.getAttribute("aria-label") ?? "")
      .filter((label) => actionPattern.test(label.trim())).length >= 2
  );
}

function hasFeedPostIdentity(element: HTMLElement): boolean {
  return (
    element.matches(POST_IDENTITY_SELECTORS.join(",")) ||
    hasPostHeading(element) ||
    hasSocialActionControls(element)
  );
}

function getPostContainerFromHeading(heading: Element): HTMLElement | null {
  const semanticContainer = heading.closest(
    POST_CONTAINER_SELECTORS.join(","),
  ) as HTMLElement | null;
  if (semanticContainer) return semanticContainer;

  const listItem = heading.closest("li") as HTMLElement | null;
  if (listItem) return listItem;

  let candidate = heading.parentElement as HTMLElement | null;
  for (let depth = 0; candidate && depth < 8; depth++) {
    const textLength = getElementText(candidate).length;
    const hasActions =
      candidate.querySelector(
        "[aria-label*='Like'], [aria-label*='Comment'], [aria-label*='Repost'], [aria-label*='Send']",
      ) !== null;

    if (textLength > 80 && hasActions) return candidate;
    candidate = candidate.parentElement as HTMLElement | null;
  }

  return heading.parentElement as HTMLElement | null;
}

function addUniquePost(posts: HTMLElement[], post: HTMLElement | null): void {
  if (!post) return;
  if (isInsideLinkedInChrome(post) || !hasFeedPostIdentity(post)) return;
  if (posts.some((existing) => existing === post || existing.contains(post))) {
    return;
  }

  const nestedIndex = posts.findIndex((existing) => post.contains(existing));
  if (nestedIndex >= 0) {
    posts.splice(nestedIndex, 1);
  }
  posts.push(post);
}

export function findLinkedInFeedPosts(
  root: ParentNode = document,
): HTMLElement[] {
  const posts: HTMLElement[] = [];

  root
    .querySelectorAll(POST_CONTAINER_SELECTORS.join(","))
    .forEach((element) => {
      const post = element as HTMLElement;
      const textLength = getElementText(post).length;
      if (textLength > 40 || hasPostHeading(post)) {
        addUniquePost(posts, post);
      }
    });

  root.querySelectorAll("h2").forEach((heading) => {
    const text = normalizeText(getElementText(heading));
    if (POST_HEADING_KEYWORDS.some((keyword) => text.includes(keyword))) {
      addUniquePost(posts, getPostContainerFromHeading(heading));
    }
  });

  return posts;
}

function getSmallLabelTexts(post: HTMLElement): string[] {
  const labels = new Set<string>();
  const labelSelectors = [
    "span",
    "a",
    "button",
    "[aria-label]",
    "[title]",
    "[data-test-id]",
  ];

  post.querySelectorAll(labelSelectors.join(",")).forEach((element) => {
    const text = normalizeText(getElementText(element));
    const ariaLabel = normalizeText(element.getAttribute("aria-label") ?? "");
    const title = normalizeText(element.getAttribute("title") ?? "");
    const dataTestId = normalizeText(
      element.getAttribute("data-test-id") ?? "",
    );

    for (const value of [text, ariaLabel, title, dataTestId]) {
      if (value && value.length <= 80) labels.add(value);
    }
  });

  return Array.from(labels);
}

function hasPromotedLabel(post: HTMLElement): boolean {
  return getSmallLabelTexts(post).some((label) =>
    PROMOTED_LABEL_KEYWORDS.some((keyword) => {
      if (keyword === "ad") {
        return label === "ad" || label === "ads";
      }
      return (
        label === keyword ||
        label.startsWith(`${keyword} `) ||
        label.endsWith(` ${keyword}`)
      );
    }),
  );
}

function hasSuggestedLabel(post: HTMLElement): boolean {
  return getSmallLabelTexts(post).some((label) =>
    SUGGESTED_KEYWORDS.some(
      (keyword) =>
        label === keyword ||
        label.startsWith(`${keyword} `) ||
        label.endsWith(` ${keyword}`),
    ),
  );
}

function hasKeyword(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function isPollPost(post: HTMLElement): boolean {
  return (
    post.querySelector('[role="radio"], [role="radiogroup"]') !== null ||
    post.innerHTML.toLowerCase().includes("poll")
  );
}

function isResharePost(text: string): boolean {
  return /reposted|репостнул|поделил/i.test(text);
}

function isVideoOnlyPost(post: HTMLElement): boolean {
  const hasVideo = post.querySelector("video") !== null;
  if (!hasVideo) return false;

  let textLength = 0;
  post.querySelectorAll("p").forEach((paragraph) => {
    const text = getElementText(paragraph);
    if (text.length > 5) textLength += text.length;
  });

  return textLength < 30;
}

export function shouldHideLinkedInPost(
  post: HTMLElement,
  filters: FilterSettings,
): boolean {
  if (!filters.enabled) return false;

  const text = normalizeText(getElementText(post));
  if (filters.hidePromoted && hasPromotedLabel(post)) return true;
  if (filters.hideSuggested && hasSuggestedLabel(post)) return true;
  if (filters.hideNewsletterAds && hasKeyword(text, NEWSLETTER_KEYWORDS)) {
    return true;
  }
  if (filters.hidePolls && isPollPost(post)) return true;
  if (filters.hideReshares && isResharePost(text)) return true;
  if (filters.hideVideoOnly && isVideoOnlyPost(post)) return true;

  return false;
}

export function isPromotedSidebarLabel(text: string): boolean {
  const label = normalizeText(text);
  if (!label || label.length > 80) return false;

  return PROMOTED_LABEL_KEYWORDS.some((keyword) => {
    if (keyword === "ad") return label === "ad" || label === "ads";
    return label === keyword || label.startsWith(`${keyword} `);
  });
}

export function isPromotionalSidebarWidget(element: HTMLElement): boolean {
  const text = normalizeText(getElementText(element));
  if (!text || text.length > 600) return false;

  if (SIDEBAR_PROMO_PHRASES.some((phrase) => text.includes(phrase))) {
    return true;
  }

  return Array.from(element.querySelectorAll("a[href], img[alt]")).some(
    (node) => {
      const href = normalizeText(node.getAttribute("href") ?? "");
      const alt = normalizeText(node.getAttribute("alt") ?? "");
      return (
        href.includes("/ad/start") ||
        href.includes("/campaignmanager/") ||
        alt.includes("advertisement") ||
        alt.includes("sponsored")
      );
    },
  );
}
