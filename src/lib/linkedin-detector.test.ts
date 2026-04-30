// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import type { FilterSettings } from "./filters";
import {
  findLinkedInFeedPosts,
  isLinkedInFeedSurface,
  isPromotedSidebarLabel,
  isPromotionalSidebarWidget,
  shouldHideLinkedInPost,
} from "./linkedin-detector";

const baseFilters: FilterSettings = {
  enabled: true,
  hidePromoted: true,
  hideSuggested: true,
  hidePolls: false,
  hideReshares: false,
  hideVideoOnly: false,
  hideNewsletterAds: true,
  hideSidebarAds: true,
  showBadge: false,
  hiddenCount: 0,
  sessionHiddenCount: 0,
};

function render(html: string): Document {
  document.body.innerHTML = html;
  return document;
}

describe("LinkedIn feed detector", () => {
  it("only enables DOM cleanup on the LinkedIn feed surface", () => {
    expect(isLinkedInFeedSurface("/feed/")).toBe(true);
    expect(isLinkedInFeedSurface("/")).toBe(false);
    expect(isLinkedInFeedSurface("/in/tugelbay-konabayev/")).toBe(false);
    expect(isLinkedInFeedSurface("/jobs/search/")).toBe(false);
    expect(isLinkedInFeedSurface("/messaging/thread/123/")).toBe(false);
  });

  it("finds semantic article feed posts without relying on headings", () => {
    const document = render(`
      <main>
        <article data-urn="urn:li:activity:123">
          <span>Alex Morgan</span>
          <p>This is a normal feed post with enough text to look realistic.</p>
        </article>
      </main>
    `);

    const posts = findLinkedInFeedPosts(document);

    expect(posts).toHaveLength(1);
    expect(posts[0].getAttribute("data-urn")).toBe("urn:li:activity:123");
  });

  it("does not treat generic profile articles as feed posts", () => {
    const document = render(`
      <main>
        <article>
          <h2>About</h2>
          <p>Sponsored a local event and wrote a profile summary.</p>
        </article>
      </main>
    `);

    expect(findLinkedInFeedPosts(document)).toHaveLength(0);
  });

  it("does not treat sidebar content as feed posts", () => {
    const document = render(`
      <aside>
        <article data-urn="urn:li:activity:side">
          <h2>Feed post</h2>
          <span>Sponsored</span>
          <p>Right rail content should not be processed as a feed item.</p>
        </article>
      </aside>
    `);

    expect(findLinkedInFeedPosts(document)).toHaveLength(0);
  });

  it("hides English sponsored posts", () => {
    const document = render(`
      <main>
        <article>
          <h2>Feed post</h2>
          <span>Sponsored</span>
          <p>Try this hiring tool today.</p>
        </article>
      </main>
    `);
    const [post] = findLinkedInFeedPosts(document);

    expect(shouldHideLinkedInPost(post, baseFilters)).toBe(true);
  });

  it("hides promoted labels that are exposed through aria-labels", () => {
    const document = render(`
      <main>
        <article>
          <h2>Feed post</h2>
          <span aria-label="Promoted"></span>
          <p>Ad creative that does not expose visible label text.</p>
        </article>
      </main>
    `);
    const [post] = findLinkedInFeedPosts(document);

    expect(shouldHideLinkedInPost(post, baseFilters)).toBe(true);
  });

  it("does not hide an organic post that only mentions sponsored in body copy", () => {
    const document = render(`
      <main>
        <article>
          <h2>Feed post</h2>
          <span>Priya Shah</span>
          <p>Our team sponsored the local developer meetup last weekend.</p>
        </article>
      </main>
    `);
    const [post] = findLinkedInFeedPosts(document);

    expect(shouldHideLinkedInPost(post, baseFilters)).toBe(false);
  });

  it("does not hide organic posts that mention suggested in body copy", () => {
    const document = render(`
      <main>
        <article>
          <h2>Feed post</h2>
          <span>Priya Shah</span>
          <p>I suggested a better onboarding flow during the product review.</p>
        </article>
      </main>
    `);
    const [post] = findLinkedInFeedPosts(document);

    expect(shouldHideLinkedInPost(post, baseFilters)).toBe(false);
  });

  it("recognizes sidebar ad labels in multiple common forms", () => {
    expect(isPromotedSidebarLabel("Sponsored")).toBe(true);
    expect(isPromotedSidebarLabel("Promoted ·")).toBe(true);
    expect(isPromotedSidebarLabel("Реклама")).toBe(true);
    expect(isPromotedSidebarLabel("This article mentions sponsored work")).toBe(
      false,
    );
  });

  it("recognizes LinkedIn right-rail self-promo widgets", () => {
    const document = render(`
      <aside>
        <section>
          <h2>LinkedIn</h2>
          <p>Your job search powered by your network</p>
          <a href="https://www.linkedin.com/jobs/">Explore jobs</a>
        </section>
      </aside>
    `);

    const widget = document.querySelector("section") as HTMLElement;

    expect(isPromotionalSidebarWidget(widget)).toBe(true);
  });

  it("does not treat normal recommendation widgets as sidebar ads", () => {
    const document = render(`
      <aside>
        <section>
          <h2>Add to your feed</h2>
          <p>Follow people and companies you may know.</p>
        </section>
      </aside>
    `);

    const widget = document.querySelector("section") as HTMLElement;

    expect(isPromotionalSidebarWidget(widget)).toBe(false);
  });

  it("does not hide normal jobs links without a promo label", () => {
    const document = render(`
      <aside>
        <section>
          <h2>Jobs recommended for you</h2>
          <a href="https://www.linkedin.com/jobs/search/">View jobs</a>
        </section>
      </aside>
    `);

    const widget = document.querySelector("section") as HTMLElement;

    expect(isPromotionalSidebarWidget(widget)).toBe(false);
  });
});
