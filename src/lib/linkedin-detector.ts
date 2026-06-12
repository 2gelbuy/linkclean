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
  "[data-urn^='urn:li:']",
  "[data-id^='urn:li:']",
  "[data-finite-scroll-hotkey-item='true']",
  ".feed-shared-update-v2",
  ".update-components-update-v2",
  "[data-view-name='feed-full-update']",
  "[data-test-id*='feed-activity']",
  // 2026 feed rewrite (data-testid="mainFeed" surface)
  "article[data-id='main-feed-card']",
  "li.feed-item",
  "[data-sponsored-tracking-url]",
];

const POST_IDENTITY_SELECTORS = [
  "[data-urn^='urn:li:']",
  "[data-id^='urn:li:']",
  "[data-finite-scroll-hotkey-item='true']",
  ".feed-shared-update-v2",
  ".update-components-update-v2",
  "[data-view-name='feed-full-update']",
  "[data-test-id*='feed-activity']",
  "article[data-id='main-feed-card']",
  "li.feed-item",
  "[data-sponsored-tracking-url]",
];

/**
 * Attributes LinkedIn itself uses to mark sponsored content.
 * Their presence is a promoted signal regardless of label language.
 * The tracking-scope check is anchored on the quoted "sponsored" token so
 * values like "sponsored-content-follow" on organic posts never match, and
 * it is only checked on the post root (not descendants) so an organic post
 * embedding sponsored-tracked sub-components survives.
 */
export const PROMOTED_STRUCTURAL_SELECTOR = [
  "[data-sponsored-tracking-url]",
  "[data-urn*='promoted']",
  "[data-id*='promoted']",
  "[data-promoted-tracking-control-name]",
].join(",");

export const PROMOTED_ROOT_ONLY_SELECTOR = `[data-view-tracking-scope*='"sponsored"']`;

const PROMOTED_LABEL_KEYWORDS = [
  "promoted",
  "promoted by",
  "sponsored",
  "ad",
  "advertisement",
  "paid partnership",
  // ru / uk
  "продвигается",
  "просувається",
  "реклама",
  "рекламная публикация",
  "рекламна публікація",
  // fr
  "sponsorisé",
  "sponsorisée",
  "post sponsorisé",
  "sponsorisé par",
  "en partenariat avec",
  "promu",
  "promu(e) par",
  "promu par",
  "promues",
  // de
  "gesponsert",
  "anzeige",
  // es / pt
  "promocionado",
  "promovido",
  "promovida",
  "patrocinado",
  // it
  "sponsorizzato",
  "post sponsorizzato",
  "promosso",
  "promosso da",
  // nl
  "gepromoot",
  "advertentie",
  // pl
  "promowane",
  "sponsorowane",
  "treść promowana",
  // sv / da / no / fi
  "sponsrad",
  "marknadsfört",
  "promoveret",
  "promotert",
  "mainostettu",
  // tr
  "sponsorlu",
  "öne çıkarılan içerik",
  "tanıtılan içerik",
  // cs / hu / ro
  "propagováno",
  "propagace",
  "kiemelt",
  "promovat",
  // id / tl
  "dipromosikan",
  "nai-promote",
  // ar / fa / he
  "الترويج",
  "تبلیغ‌شده",
  "ממומן",
  // hi / mr / pa / bn / te
  "प्रमोट किया गया",
  "प्रमोट केले",
  "ਪ੍ਰੋਮੋਟ ਕੀਤਾ ਗਿਆ",
  "ਪ੍ਰੋਮੋਟ ਕੀਤਾ",
  "প্রমোটেড",
  "ప్రమోట్ చేయబడింది",
  // th / vi
  "ได้รับการโปรโมท",
  "được quảng bá",
  // ja / ko / zh
  "プロモーション",
  "광고",
  "주최:",
  "广告",
  "推广",
  "促銷內容",
  "贊助",
  // el
  "προωθημένη",
];

const SUGGESTED_KEYWORDS = [
  "suggested",
  "suggestions",
  "рекомендуется",
  "рекомендовано",
  "рекомендуем для вас",
  "рекомендовані для вас",
  "suggéré",
  "recommandé pour vous",
  "vorgeschlagen",
  "für sie empfohlen",
  "sugerido",
  "sugerencias",
  "te recomendamos",
  "sugestões",
  "recomendações para você",
  "suggerito",
  "consigliato per te",
  "voorgesteld",
  "aanbevolen voor u",
  "recommended for you",
  "polecane dla ciebie",
  "doporučeno pro vás",
  "sizin için önerilenler",
  "anbefalet til dig",
  "anbefalt for deg",
  "rekommenderat för dig",
  "suositellut sinulle",
  "önnek javasolt",
  "recomandat pentru dvs.",
  "rekomendasi untuk anda",
  "dicadangkan untuk anda",
  "inirerekomenda para sa iyo",
  "आपके लिए सुझाव",
  "مقترح لك",
  "מומלצים עבורך",
  "为您推荐",
  "精選內容",
  "おすすめのコース",
  "맞춤 추천",
  "추천됨",
  "แนะนำสำหรับคุณ",
  "đề xuất cho bạn",
  "προτεινόμενα για εσάς",
];

// Compared against normalizeText() output, so normalize the keywords too
// (strips the parens in "опубликовал(а)" the same way as in live text).
const NEWSLETTER_KEYWORDS = [
  "subscribe to this newsletter",
  "подпишитесь на рассылку",
  "published a newsletter",
  "опубликовал(а) рассылку",
  "see my newsletter",
  "см. мою рассылку",
].map((keyword) => normalizeText(keyword));

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

const MAX_LABEL_TEXT_LENGTH = 200;

const LABEL_TEXT_SELECTORS = [
  "span",
  "a",
  "button",
  "div",
  "[aria-label]",
  "[aria-describedby]",
  "[title]",
  "img[alt]",
  "[data-test-id]",
  "[data-promoted-tracking-control-name]",
  ".visually-hidden",
  "[class*='visually-hidden']",
  "[class*='sub-description']",
  "[class*='supplementary']",
  "[class*='actor__description']",
];

const BODY_TEXT_SELECTORS = [
  "p",
  "[class*='commentary']",
  "[class*='inline-show-more-text']",
  "[class*='update-components-text']",
  "[data-test-id*='commentary']",
];

function getElementText(element: Element): string {
  // textContent (not innerText): no forced reflow, and it still works on
  // posts we already hid with display:none.
  return (element.textContent || "").replace(/\s+/g, " ").trim();
}

function normalizeText(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\u200B-\u200F\u2060\uFEFF\u00AD]/g, "")
    .replace(/[·•・|:;,.()[\]{}_–—、。，．：；｜-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Two matching tiers:
 * - LOOSE (word-boundary) matching is limited to the keyword list that
 *   already shipped in v1.3.4 without false-positive reports. Applying it
 *   to the expanded list would hide organic posts (e.g. a French headline
 *   "Promu directeur en 2025" or a ja job title with a promoted-like word).
 * - STRICT (full equality after normalization) applies to every keyword,
 *   mirroring how LinkedIn renders the label as a standalone node.
 */
const LOOSE_PROMOTED_KEYWORDS = [
  "promoted",
  "sponsored",
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
].map(normalizeText);

const LOOSE_SUGGESTED_KEYWORDS = [
  "suggested",
  "рекомендуется",
  "рекомендовано",
  "suggéré",
  "vorgeschlagen",
  "sugerido",
  "suggerito",
  "voorgesteld",
].map(normalizeText);

const STRICT_PROMOTED_SET = new Set(PROMOTED_LABEL_KEYWORDS.map(normalizeText));
const STRICT_SUGGESTED_SET = new Set(SUGGESTED_KEYWORDS.map(normalizeText));

/**
 * LinkedIn-generated metadata lines ("Acme · 11,234 followers · Promoted ·
 * 2d"). No user-authored text appears in these, so token-level equality is
 * safe here even for 2-char CJK keywords that would collide with organic
 * text anywhere else.
 */
const METADATA_LINE_SELECTOR =
  "[class*='sub-description'], [class*='supplementary']";

function metadataLineTokensMatch(
  post: HTMLElement,
  keywords: Set<string>,
): boolean {
  return Array.from(post.querySelectorAll(METADATA_LINE_SELECTOR)).some(
    (line) => {
      const text = normalizeText(getElementText(line));
      if (!text || text.length > MAX_LABEL_TEXT_LENGTH) return false;
      return text.split(" ").some((token) => keywords.has(token));
    },
  );
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
      const text = normalizeText(getElementText(post));
      const textLength = text.length;
      if (
        textLength > 40 ||
        hasPostHeading(post) ||
        hasAnyFeedLabelSignal(text) ||
        hasPromotedStructuralMarker(post)
      ) {
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

  const addLabel = (value: string | null): void => {
    const label = normalizeText(value ?? "");
    if (label && label.length <= MAX_LABEL_TEXT_LENGTH) labels.add(label);
  };

  const addDescribedByLabels = (element: Element): void => {
    const ownerDocument = element.ownerDocument;
    const describedBy = element.getAttribute("aria-describedby");
    if (!describedBy) return;

    describedBy.split(/\s+/).forEach((id) => {
      const description = ownerDocument.getElementById(id);
      if (description) addLabel(getElementText(description));
    });
  };

  const shouldCollectText = (element: Element, text: string): boolean => {
    if (!text || text.length > MAX_LABEL_TEXT_LENGTH) return false;
    if (!hasAnyFeedLabelSignal(text)) return false;
    if (element.closest(BODY_TEXT_SELECTORS.join(","))) return false;
    // Label elements never contain body copy. Without this guard a short
    // organic post's container div would be collected as a "label" and a
    // body mention of "sponsored" would hide the whole post.
    if (element.querySelector(BODY_TEXT_SELECTORS.join(","))) return false;

    return (
      element.matches("[aria-label], [aria-describedby], [title], img[alt]") ||
      element.matches(
        ".visually-hidden, [class*='visually-hidden'], [class*='sub-description'], [class*='supplementary'], [class*='actor__description']",
      ) ||
      ["SPAN", "A", "BUTTON", "DIV"].includes(element.tagName)
    );
  };

  [
    post,
    ...Array.from(post.querySelectorAll(LABEL_TEXT_SELECTORS.join(","))),
  ].forEach((element) => {
    addLabel(element.getAttribute("aria-label"));
    addLabel(element.getAttribute("title"));
    addLabel(element.getAttribute("alt"));
    addLabel(element.getAttribute("data-test-id"));
    addLabel(element.getAttribute("data-promoted-tracking-control-name"));
    addDescribedByLabels(element);

    const text = normalizeText(getElementText(element));
    if (shouldCollectText(element, text)) {
      labels.add(text);
    }
  });

  return Array.from(labels);
}

function labelMatchesKeyword(label: string, keyword: string): boolean {
  if (keyword === "ad") {
    return label === "ad" || label === "ads";
  }

  return (
    label === keyword ||
    label.startsWith(`${keyword} `) ||
    label.endsWith(` ${keyword}`) ||
    label.includes(` ${keyword} `)
  );
}

function labelStartsWithKeyword(label: string, keyword: string): boolean {
  if (keyword === "ad") {
    return label === "ad" || label === "ads";
  }

  return label === keyword || label.startsWith(`${keyword} `);
}

function hasAnyFeedLabelSignal(label: string): boolean {
  return (
    STRICT_PROMOTED_SET.has(label) ||
    STRICT_SUGGESTED_SET.has(label) ||
    LOOSE_PROMOTED_KEYWORDS.some((keyword) =>
      labelMatchesKeyword(label, keyword),
    ) ||
    LOOSE_SUGGESTED_KEYWORDS.some((keyword) =>
      labelMatchesKeyword(label, keyword),
    )
  );
}

/**
 * 2026 feed DOM renders the "Promoted"/"Suggested" actor line inside
 * <p componentkey> elements, which the loose label collector skips as body
 * copy. Collect short metadata candidates from <p> elements and match them
 * with strict equality only, so organic body text never false-positives.
 */
function getStrictMetadataTexts(post: HTMLElement): string[] {
  const texts: string[] = [];

  post.querySelectorAll("p").forEach((paragraph) => {
    const fullText = normalizeText(getElementText(paragraph));
    if (!fullText || fullText.length > MAX_LABEL_TEXT_LENGTH) return;

    texts.push(fullText);

    paragraph.childNodes.forEach((node) => {
      // Direct text nodes handle "Promoted by <a>Company</a>" splits.
      if (node.nodeType === 3) {
        const text = normalizeText(node.textContent ?? "");
        if (text) texts.push(text);
      }
    });

    paragraph.querySelectorAll(":scope > span").forEach((span) => {
      const text = normalizeText(getElementText(span));
      if (text && text.length <= MAX_LABEL_TEXT_LENGTH) texts.push(text);
    });
  });

  return texts;
}

function hasStrictMetadataKeyword(
  post: HTMLElement,
  keywords: Set<string>,
): boolean {
  return getStrictMetadataTexts(post).some((text) => keywords.has(text));
}

export function hasPromotedStructuralMarker(post: HTMLElement): boolean {
  return (
    post.matches(PROMOTED_ROOT_ONLY_SELECTOR) ||
    post.matches(PROMOTED_STRUCTURAL_SELECTOR) ||
    post.querySelector(PROMOTED_STRUCTURAL_SELECTOR) !== null
  );
}

function hasPromotedLabel(post: HTMLElement): boolean {
  return (
    getSmallLabelTexts(post).some(
      (label) =>
        STRICT_PROMOTED_SET.has(label) ||
        LOOSE_PROMOTED_KEYWORDS.some((keyword) =>
          labelMatchesKeyword(label, keyword),
        ),
    ) ||
    hasStrictMetadataKeyword(post, STRICT_PROMOTED_SET) ||
    metadataLineTokensMatch(post, STRICT_PROMOTED_SET)
  );
}

function hasSuggestedLabel(post: HTMLElement): boolean {
  return (
    getSmallLabelTexts(post).some(
      (label) =>
        STRICT_SUGGESTED_SET.has(label) ||
        LOOSE_SUGGESTED_KEYWORDS.some((keyword) =>
          labelMatchesKeyword(label, keyword),
        ),
    ) ||
    hasStrictMetadataKeyword(post, STRICT_SUGGESTED_SET) ||
    metadataLineTokensMatch(post, STRICT_SUGGESTED_SET)
  );
}

function hasKeyword(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function isPollPost(post: HTMLElement): boolean {
  // No innerHTML scan: organic posts merely mentioning "poll" must survive.
  return (
    post.querySelector(
      "[role='radio'], [role='radiogroup'], [class*='poll']",
    ) !== null
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
  if (
    filters.hidePromoted &&
    (hasPromotedStructuralMarker(post) || hasPromotedLabel(post))
  ) {
    return true;
  }
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
  if (!label || label.length > MAX_LABEL_TEXT_LENGTH) return false;

  return (
    STRICT_PROMOTED_SET.has(label) ||
    LOOSE_PROMOTED_KEYWORDS.some((keyword) => {
      return labelStartsWithKeyword(label, keyword);
    })
  );
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
