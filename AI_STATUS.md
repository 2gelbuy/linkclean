# Project Status

> Auto-updated. Read this before starting any work.
> Last updated: 2026-03-28 12:17

## Goal

LinkClean — Chrome extension that cleans LinkedIn feed from promoted posts, suggested content, newsletter ads, polls, reshares, and video-only posts. Freemium model via LemonSqueezy. Published on Chrome Web Store.
Success = 1000+ active users, positive reviews, Pro upgrade revenue.

## In Progress

- Directory & news site submissions research — created SUBMISSION_LOG.md with full guide

## Done

- Initial extension build (WXT + React + Tailwind)
- Content script: text-based detection for LinkedIn 2026 DOM (multilingual)
- Popup UI with 8 filter toggles + stats
- Background service worker with badge count
- GA4 analytics scaffolding (Measurement Protocol, no cookies)
- LemonSqueezy license/freemium scaffolding
- Runware-generated icon + CWS marketing assets (screenshots, promo images)
- Marketing analysis: competitors, positioning, pricing
- Pre-commit hook (Prettier auto-format)
- LinkedIn 2026 DOM selector fix
- **Published on Chrome Web Store**
- Landing page live at konabayev.com/linkclean/ (Astro, full SEO, privacy policy)
- v1.0.1 submitted to CWS — fix: sidebar promoted ads not hidden
- Firefox build ready (MV2, gecko ID, zip + sources)
- Edge build ready (same Chrome MV3 zip)
- **Dev.to article published** — "I Built a Chrome Extension to Clean My LinkedIn Feed — Here's How" (850 words, 3min read, canonical URL set)

## Next Up

1. **Execute directory submissions** (see SUBMISSION_LOG.md for complete guide):
   - Tier 1: Product Hunt, TinyHunt, Softonic, FossHub
   - Tier 2: Reddit (r/chrome_extensions, r/Entrepreneur), HackerNews, IndieHackers
2. GA4 API secret — add to enable analytics
3. Uninstall feedback page at konabayev.com/linkclean/uninstall/
4. LemonSqueezy product setup + Pro features gating
5. Cross-post Dev.to article to Medium, Hashnode
6. AMO (Firefox) & Edge Add-ons submissions (future browsers)

## Key Decisions

- **WXT framework** for cross-browser extension dev
- **Text-based detection** (not CSS classes) — LinkedIn obfuscates class names
- **Freemium via LemonSqueezy** — no server needed for license validation
- **GA4 Measurement Protocol** — privacy-first, no cookies
- **Multilingual keyword matching** — 11 languages for promoted, 7 for suggested

<!-- AUTO:GIT_LOG -->

## Recent Commits

```
78df21e auto: AI_STATUS.md
0cb5c04 auto: AI_STATUS.md
20d0d3f auto: AI_STATUS.md, amo-metadata.json
a229693 auto: AI_STATUS.md
66e0ace auto: AI_STATUS.md
f8d1a52 docs: update AI_STATUS.md with directory submission status
211c835 auto: .playwright-mcp/console-2026-03-28T06-14-39-301Z.log
60f0964 docs: add comprehensive directory submission guide
3db5825 auto: AI_STATUS.md, .playwright-mcp/console-2026-03-28T06-11-43-027Z.log, ....
6c6fc8d auto: AI_STATUS.md, .playwright-mcp/console-2026-03-28T06-11-29-819Z.log
```

<!-- /AUTO:GIT_LOG -->

<!-- AUTO:GIT_STATUS -->

## Uncommitted Changes

Branch: `master`
_Clean working tree._

<!-- /AUTO:GIT_STATUS -->

```

```
