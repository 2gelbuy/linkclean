import { afterEach, describe, expect, it, vi } from "vitest";
import { getActiveFeedReport, getActiveFeedStatus } from "./feed-status";

afterEach(() => vi.unstubAllGlobals());

describe("feed connection status", () => {
  it("accepts only bounded card counts from the active tab", async () => {
    const sendMessage = vi.fn().mockResolvedValue({
      type: "linkclean:status",
      onFeed: true,
      cardsFound: 12,
      cardsHidden: 2,
    });
    vi.stubGlobal("chrome", {
      tabs: { query: vi.fn().mockResolvedValue([{ id: 7 }]), sendMessage },
    });
    expect(await getActiveFeedReport()).toEqual({
      status: "connected",
      cardsFound: 12,
      cardsHidden: 2,
    });
    for (const invalid of [-1, 1.5, 10001, "12", { text: "private" }]) {
      sendMessage.mockResolvedValue({
        type: "linkclean:status",
        onFeed: true,
        cardsFound: invalid,
        cardsHidden: invalid,
      });
      expect(await getActiveFeedReport()).toEqual({
        status: "connected",
        cardsFound: undefined,
        cardsHidden: undefined,
      });
    }
  });
  it("does not claim filtering is active when the tab predates installation", async () => {
    vi.stubGlobal("chrome", {
      tabs: {
        query: vi.fn().mockResolvedValue([{ id: 7 }]),
        sendMessage: vi
          .fn()
          .mockRejectedValue(new Error("Receiving end does not exist")),
      },
    });
    expect(await getActiveFeedStatus()).toBe("reload-needed");
  });

  it("distinguishes a connected feed from another LinkedIn page", async () => {
    const sendMessage = vi
      .fn()
      .mockResolvedValue({ type: "linkclean:status", onFeed: false });
    vi.stubGlobal("chrome", {
      tabs: { query: vi.fn().mockResolvedValue([{ id: 7 }]), sendMessage },
    });
    expect(await getActiveFeedStatus()).toBe("other-page");
    sendMessage.mockResolvedValue({ type: "linkclean:status", onFeed: true });
    expect(await getActiveFeedStatus()).toBe("connected");
  });

  it("treats a stale or unrelated reply as disconnected", async () => {
    vi.stubGlobal("chrome", {
      tabs: {
        query: vi.fn().mockResolvedValue([{ id: 7 }]),
        sendMessage: vi.fn().mockResolvedValue(undefined),
      },
    });
    expect(await getActiveFeedStatus()).toBe("reload-needed");
  });

  it("asks for site access only when the browser reports it is withheld", async () => {
    const contains = vi.fn().mockResolvedValue(false);
    vi.stubGlobal("chrome", {
      tabs: {
        query: vi.fn().mockResolvedValue([{ id: 7 }]),
        sendMessage: vi
          .fn()
          .mockRejectedValue(new Error("Receiving end does not exist")),
      },
      permissions: { contains },
    });
    expect(await getActiveFeedStatus()).toBe("no-site-access");
    expect(contains).toHaveBeenCalledWith({
      origins: ["*://*.linkedin.com/*"],
    });
    contains.mockResolvedValue(true);
    expect(await getActiveFeedStatus()).toBe("reload-needed");
    contains.mockRejectedValue(new Error("unavailable"));
    expect(await getActiveFeedStatus()).toBe("reload-needed");
  });
});
