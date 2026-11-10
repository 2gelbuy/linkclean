// @vitest-environment jsdom
// @vitest-environment-options {"url":"https://www.linkedin.com/feed/"}
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getFilters: vi.fn(),
  incrementHiddenCount: vi.fn(),
}));
vi.mock("./filters", () => mocks);

const defaults = {
  enabled: true,
  hidePromoted: true,
  hideSuggested: true,
  hidePolls: false,
  hideReshares: false,
  hideVideoOnly: false,
  hideNewsletterAds: true,
  hideSidebarAds: false,
  showBadge: false,
  hiddenCount: 0,
  sessionHiddenCount: 0,
};
const observers: MutationObserver[] = [];
const cleanup: Array<() => void> = [];
let storageListener: (changes: unknown, area: string) => void;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(1_000);
  history.replaceState({}, "", "/feed/");
  document.head.innerHTML = "";
  document.body.innerHTML = `<main data-testid="mainFeed">
    <div role="listitem" id="organic"><h2>Feed post</h2><p>A useful organic update with enough content to identify a post.</p></div>
    <div role="listitem" id="ad"><h2>Feed post</h2><p componentkey="actor-line"><span>Promoted</span></p><p>A product update with enough content to identify a post.</p></div>
  </main>`;
  mocks.getFilters.mockResolvedValue({ ...defaults });
  mocks.incrementHiddenCount.mockResolvedValue(undefined);
  const NativeObserver = globalThis.MutationObserver;
  vi.stubGlobal(
    "MutationObserver",
    class extends NativeObserver {
      constructor(callback: MutationCallback) {
        super(callback);
        observers.push(this);
      }
    },
  );
  vi.stubGlobal("defineContentScript", (definition: unknown) => definition);
  vi.stubGlobal("chrome", {
    storage: {
      onChanged: {
        addListener: vi.fn((fn) => {
          storageListener = fn;
        }),
        removeListener: vi.fn(),
      },
    },
    runtime: {
      sendMessage: vi.fn().mockResolvedValue(undefined),
      onMessage: { addListener: vi.fn(), removeListener: vi.fn() },
    },
  });
});

afterEach(() => {
  observers.splice(0).forEach((observer) => observer.disconnect());
  cleanup.splice(0).forEach((fn) => fn());
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

async function start() {
  const script = (await import("../entrypoints/linkedin-feed.content")).default;
  const ctx = {
    addEventListener: (
      target: EventTarget,
      name: string,
      fn: EventListener,
    ) => {
      target.addEventListener(name, fn);
      cleanup.push(() => target.removeEventListener(name, fn));
    },
    onInvalidated: (fn: () => void) => cleanup.push(fn),
  };
  await script.main(ctx as never);
  await vi.advanceTimersByTimeAsync(300);
}

describe("LinkedIn content script lifecycle", () => {
  it("hides the current promoted listitem while retaining organic posts", async () => {
    await start();
    expect(
      document.querySelector("#ad")?.getAttribute("data-linkclean-hidden"),
    ).toBe("true");
    expect(
      document.querySelector("#organic")?.hasAttribute("data-linkclean-hidden"),
    ).toBe(false);
  });

  it("restores a recycled card when its promoted label is removed", async () => {
    await start();
    document.querySelector("#ad p[componentkey]")?.remove();
    await vi.advanceTimersByTimeAsync(300);
    expect(
      document.querySelector("#ad")?.hasAttribute("data-linkclean-hidden"),
    ).toBe(false);
  });

  it("restores feed elements on a client-side route change without a DOM mutation", async () => {
    await start();
    history.pushState({}, "", "/in/example/");
    window.dispatchEvent(new CustomEvent("wxt:locationchange"));
    await vi.advanceTimersByTimeAsync(300);
    expect(
      document.querySelector("#ad")?.hasAttribute("data-linkclean-hidden"),
    ).toBe(false);
  });

  it("restores hidden posts when filtering is switched off", async () => {
    await start();
    storageListener(
      { linkclean_filters: { newValue: { ...defaults, enabled: false } } },
      "local",
    );
    await vi.advanceTimersByTimeAsync(300);
    expect(
      document.querySelector("#ad")?.hasAttribute("data-linkclean-hidden"),
    ).toBe(false);
  });
});
