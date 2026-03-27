# Project Status

> Auto-updated. Read this before starting any work.
> Last updated: 2026-03-27 18:26

## Goal

LinkClean — Chrome extension that cleans LinkedIn feed from promoted posts, suggested content, newsletter ads, polls, reshares, and video-only posts. Freemium model via LemonSqueezy. Published on Chrome Web Store.
Success = 1000+ active users, positive reviews, Pro upgrade revenue.

## In Progress

(nothing active)

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

## Next Up

1. GA4 API secret — add to enable analytics
2. AMO submission (manual — need AMO account login)
3. Edge Add-ons submission (manual — need Microsoft Partner account)
4. Uninstall feedback page at konabayev.com/linkclean/uninstall/
5. LemonSqueezy product setup + Pro features gating
6. CWS growth: keyword optimization, review prompts

## Key Decisions

- **WXT framework** for cross-browser extension dev
- **Text-based detection** (not CSS classes) — LinkedIn obfuscates class names
- **Freemium via LemonSqueezy** — no server needed for license validation
- **GA4 Measurement Protocol** — privacy-first, no cookies
- **Multilingual keyword matching** — 11 languages for promoted, 7 for suggested

<!-- AUTO:GIT_LOG -->

## Recent Commits

```
8224a2e auto: package.json, wxt.config.ts
494aed1 auto: AI_STATUS.md
1fc542b auto: AI_STATUS.md, src/entrypoints/linkedin-feed.content.ts
ab65335 auto: AI_STATUS.md
fece9a6 auto: AI_STATUS.md, .claude/, .playwright-mcp/
63a1877 auto: AI_STATUS.md
9706ba4 auto: AI_STATUS.md
6a18920 auto: assets/screenshots/03-stats.png, package-lock.json, package.json, src...
191723f feat: add pre-commit hook with Prettier auto-format
58f4df7 feat: add Runware-generated icon and CWS marketing assets
```

<!-- /AUTO:GIT_LOG -->

<!-- AUTO:GIT_STATUS -->

## Uncommitted Changes

Branch: `master`

```
M  AI_STATUS.md
```

<!-- /AUTO:GIT_STATUS -->
