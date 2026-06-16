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

  it("finds newer LinkedIn feed update containers", () => {
    const document = render(`
      <main>
        <div data-view-name="feed-full-update">
          <span>Alex Morgan</span>
          <p>This is a normal feed post with enough text to look realistic.</p>
        </div>
      </main>
    `);

    const posts = findLinkedInFeedPosts(document);

    expect(posts).toHaveLength(1);
    expect(posts[0].getAttribute("data-view-name")).toBe("feed-full-update");
  });

  it("finds LinkedIn posts with newer URN families", () => {
    const document = render(`
      <main>
        <div data-urn="urn:li:ugcPost:123">
          <span>Acme Inc · Promoted · 2d</span>
          <button aria-label="Like this post">Like</button>
          <button aria-label="Comment on this post">Comment</button>
        </div>
      </main>
    `);

    const posts = findLinkedInFeedPosts(document);

    expect(posts).toHaveLength(1);
    expect(posts[0].getAttribute("data-urn")).toBe("urn:li:ugcPost:123");
  });

  it("finds short image-style ads when they expose a promoted signal", () => {
    const document = render(`
      <main>
        <div data-urn="urn:li:promotedCreative:123">
          <span>Promoted</span>
          <a href="https://www.linkedin.com/ad/start">Learn more</a>
        </div>
      </main>
    `);

    const posts = findLinkedInFeedPosts(document);

    expect(posts).toHaveLength(1);
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

  it("hides promoted labels rendered in compact actor description divs", () => {
    const document = render(`
      <main>
        <article>
          <h2>Feed post</h2>
          <div class="update-components-actor__sub-description">
            Promoted · 2nd
          </div>
          <p>Try this hiring tool today.</p>
        </article>
      </main>
    `);
    const [post] = findLinkedInFeedPosts(document);

    expect(shouldHideLinkedInPost(post, baseFilters)).toBe(true);
  });

  it("hides promoted labels embedded in actor metadata lines", () => {
    const document = render(`
      <main>
        <article>
          <h2>Feed post</h2>
          <div class="update-components-actor__sub-description">
            Acme Inc · 11,234 followers · Promoted · 2d
          </div>
          <p>Try this hiring tool today.</p>
        </article>
      </main>
    `);
    const [post] = findLinkedInFeedPosts(document);

    expect(shouldHideLinkedInPost(post, baseFilters)).toBe(true);
  });

  it("hides promoted labels exposed through LinkedIn ad tracking attributes", () => {
    const document = render(`
      <main>
        <article data-promoted-tracking-control-name="sponsored_feed_ad">
          <h2>Feed post</h2>
          <p>Try this hiring tool today.</p>
        </article>
      </main>
    `);
    const [post] = findLinkedInFeedPosts(document);

    expect(shouldHideLinkedInPost(post, baseFilters)).toBe(true);
  });

  it("hides promoted labels referenced by aria-describedby", () => {
    const document = render(`
      <main>
        <article aria-describedby="promo-label">
          <h2>Feed post</h2>
          <span id="promo-label" class="visually-hidden">
            This is a promoted post
          </span>
          <p>Ad creative where the label is only exposed to accessibility APIs.</p>
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

  it("does not hide organic commentary spans that mention sponsored work", () => {
    const document = render(`
      <main>
        <article>
          <h2>Feed post</h2>
          <span>Priya Shah</span>
          <div class="update-components-text">
            <span>We sponsored the local developer meetup last weekend.</span>
          </div>
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

  it("hides promoted posts in the 2026 main-feed-card DOM with p[componentkey] labels", () => {
    const document = render(`
      <main data-testid="mainFeed">
        <article data-id="main-feed-card">
          <p componentkey="actor-line"><span>Promoted</span></p>
          <p>Try this hiring tool today and grow your pipeline faster.</p>
        </article>
      </main>
    `);
    const posts = findLinkedInFeedPosts(document);

    expect(posts).toHaveLength(1);
    expect(shouldHideLinkedInPost(posts[0], baseFilters)).toBe(true);
  });

  it("hides posts that carry LinkedIn's sponsored tracking attributes", () => {
    const document = render(`
      <main>
        <article data-id="main-feed-card" data-sponsored-tracking-url="https://www.linkedin.com/li/track">
          <p>Short ad creative without any visible label text at all.</p>
        </article>
      </main>
    `);
    const posts = findLinkedInFeedPosts(document);

    expect(posts).toHaveLength(1);
    expect(shouldHideLinkedInPost(posts[0], baseFilters)).toBe(true);
  });

  it("hides posts whose view tracking scope marks the sponsored transporter", () => {
    const document = render(`
      <main>
        <div data-urn="urn:li:activity:42" data-view-tracking-scope='[{"breadcrumb":{"transporterKeys":["sponsored"]}}]'>
          <span>Acme Inc</span>
          <p>This ad creative has enough text to register as a feed post.</p>
        </div>
      </main>
    `);
    const posts = findLinkedInFeedPosts(document);

    expect(posts).toHaveLength(1);
    expect(shouldHideLinkedInPost(posts[0], baseFilters)).toBe(true);
  });

  it("hides promoted labels in languages without spaces (ja/zh/ko)", () => {
    for (const label of ["プロモーション", "广告", "광고"]) {
      const document = render(`
        <main>
          <article data-urn="urn:li:activity:77">
            <h2>Feed post</h2>
            <span>${label}</span>
            <p>Localized ad creative with enough text to look like a post.</p>
          </article>
        </main>
      `);
      const [post] = findLinkedInFeedPosts(document);

      expect(shouldHideLinkedInPost(post, baseFilters)).toBe(true);
    }
  });

  it("hides promoted tokens inside LinkedIn metadata lines (CJK combined line)", () => {
    const document = render(`
      <main>
        <article data-urn="urn:li:activity:78">
          <h2>Feed post</h2>
          <div class="update-components-actor__sub-description">
            Acme株式会社・プロモーション・2日
          </div>
          <p>Localized ad creative with enough text to look like a post.</p>
        </article>
      </main>
    `);
    const [post] = findLinkedInFeedPosts(document);

    expect(shouldHideLinkedInPost(post, baseFilters)).toBe(true);
  });

  it("does not hide organic posts when sponsored only appears in interaction tracking scopes", () => {
    const document = render(`
      <main>
        <div data-urn="urn:li:activity:55" data-view-tracking-scope='[{"breadcrumb":{"transporterKeys":["sponsored-content-follow"]}}]'>
          <span>Priya Shah</span>
          <p>Organic post where a user interacted with shared sponsored content.</p>
        </div>
      </main>
    `);
    const posts = findLinkedInFeedPosts(document);

    expect(posts).toHaveLength(1);
    expect(shouldHideLinkedInPost(posts[0], baseFilters)).toBe(false);
  });

  it("does not hide organic posts whose author headline contains promoted-like words", () => {
    const document = render(`
      <main>
        <article data-urn="urn:li:activity:56">
          <h2>Feed post</h2>
          <div class="update-components-actor__description">
            Open to suggestions | Promu directeur général chez Acme
          </div>
          <p>Organic post written by a marketer with a tricky headline.</p>
        </article>
      </main>
    `);
    const [post] = findLinkedInFeedPosts(document);

    expect(shouldHideLinkedInPost(post, baseFilters)).toBe(false);
  });

  it("hides poll posts via structural markers when the poll filter is on", () => {
    const document = render(`
      <main>
        <article data-urn="urn:li:activity:57">
          <h2>Feed post</h2>
          <span>Priya Shah</span>
          <div class="update-components-poll">Which framework do you prefer?</div>
          <p>Vote below and share your reasoning in the comments.</p>
        </article>
      </main>
    `);
    const [post] = findLinkedInFeedPosts(document);

    expect(
      shouldHideLinkedInPost(post, { ...baseFilters, hidePolls: true }),
    ).toBe(true);
  });

  it("does not hide organic main-feed-card posts that mention promoted in body copy", () => {
    const document = render(`
      <main data-testid="mainFeed">
        <article data-id="main-feed-card">
          <p componentkey="actor-line"><span>Priya Shah</span></p>
          <p>We promoted our community meetup last weekend and it sold out.</p>
        </article>
      </main>
    `);
    const posts = findLinkedInFeedPosts(document);

    expect(posts).toHaveLength(1);
    expect(shouldHideLinkedInPost(posts[0], baseFilters)).toBe(false);
  });

  it("does not hide an organic post that only embeds a sponsored-tracked sub-component deep in its subtree", () => {
    // Regression for the v1.3.5 "hid every post" report: a full-subtree
    // querySelector for sponsored markers matched LinkedIn's embedded
    // tracking beacons / social-proof chips inside organic posts.
    const document = render(`
      <main data-testid="mainFeed">
        <article data-id="main-feed-card">
          <p componentkey="actor-line"><span>Priya Shah</span></p>
          <p>Sharing what worked for our team this hiring season.</p>
          <section class="feed-social-context">
            <div>
              <span data-sponsored-tracking-url="https://www.linkedin.com/li/track"></span>
            </div>
          </section>
        </article>
      </main>
    `);
    const posts = findLinkedInFeedPosts(document);

    expect(posts).toHaveLength(1);
    expect(shouldHideLinkedInPost(posts[0], baseFilters)).toBe(false);
  });

  it("still hides an ad whose sponsored marker is on a direct card wrapper", () => {
    const document = render(`
      <main data-testid="mainFeed">
        <article data-id="main-feed-card">
          <div data-sponsored-tracking-url="https://www.linkedin.com/li/track">
            <p>Short ad creative without any visible label text at all.</p>
          </div>
        </article>
      </main>
    `);
    const posts = findLinkedInFeedPosts(document);

    expect(posts).toHaveLength(1);
    expect(shouldHideLinkedInPost(posts[0], baseFilters)).toBe(true);
  });

  it("hides only the promoted card in a multi-post feed, leaving organic siblings visible", () => {
    const document = render(`
      <main data-testid="mainFeed">
        <article data-id="main-feed-card">
          <p componentkey="actor-line"><span>Priya Shah</span></p>
          <p>First organic update with a healthy amount of body text here.</p>
        </article>
        <article data-id="main-feed-card" data-sponsored-tracking-url="https://www.linkedin.com/li/track">
          <p componentkey="actor-line"><span>Acme Inc</span></p>
          <p>Promoted creative pushing a product launch this week.</p>
        </article>
        <article data-id="main-feed-card">
          <p componentkey="actor-line"><span>Sam Lee</span></p>
          <p>Second organic update, also with enough text to be a real post.</p>
        </article>
      </main>
    `);
    const posts = findLinkedInFeedPosts(document);

    expect(posts).toHaveLength(3);
    const hidden = posts.filter((post) =>
      shouldHideLinkedInPost(post, baseFilters),
    );
    expect(hidden).toHaveLength(1);
    expect(hidden[0].getAttribute("data-sponsored-tracking-url")).toBe(
      "https://www.linkedin.com/li/track",
    );
  });

  it("does not hide organic posts that merely mention poll in body copy", () => {
    const document = render(`
      <main>
        <article data-urn="urn:li:activity:99">
          <h2>Feed post</h2>
          <span>Priya Shah</span>
          <p>The poll results from last week's survey are finally in.</p>
        </article>
      </main>
    `);
    const [post] = findLinkedInFeedPosts(document);

    expect(
      shouldHideLinkedInPost(post, { ...baseFilters, hidePolls: true }),
    ).toBe(false);
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
