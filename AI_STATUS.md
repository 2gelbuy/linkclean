# Project Status

> Auto-updated. Read this before starting any work.
> Last updated: 2026-03-28 23:07

## Goal

LinkClean — Chrome extension that cleans LinkedIn feed from promoted posts, suggested content, newsletter ads, polls, reshares, and video-only posts. Freemium model via LemonSqueezy. Published on Chrome Web Store.
Success = 1000+ active users, positive reviews, Pro upgrade revenue.

## In Progress

- Firefox AMO — uploaded, waiting for review (slug: linkclean-linkedin-feed-cleane)

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
- **CWS v1.1.0 published** — sidebar ads fix + 28 locales + SEO-optimized title/desc
- Landing page live at konabayev.com/linkclean/ (Astro, full SEO, privacy policy)
- CWS API auto-publish configured (publish.sh in MiranaApps)
- Firefox AMO uploaded via web-ext sign (waiting review)
- Dev.to article published: https://dev.to/konabayev/i-built-a-chrome-extension-to-clean-my-linkedin-feed-heres-how-541c
- 2 GitHub Awesome list PRs: best-chrome-extensions#22, awesome-productivity#228
- 28 CWS locales (en, ru, de, fr, es, tr, uk, pl, it, nl, sv, pt_BR, pt_PT, ja, ko, id, hi, ar, zh_CN, zh_TW, da, fi, no, cs, ro, hu, th, vi)
- Centralized credentials in MiranaApps/.env.shared
- Firefox AMO JWT credentials saved
- WORKFLOW_PLAN.md — full auto + semi-auto pipeline plan
- auto-scan.sh + build-extension.sh scripts created

## Next Up

1. Sync scripts to VPS + set up daily cron for auto-scan
2. Telegram notifications (need chat_id)
3. Edge Add-ons credentials + submission
4. Register on: Hashnode, ProductHunt, AlternativeTo, SaaSHub (manual Google OAuth)
5. GA4 API secret
6. LemonSqueezy product setup + Pro features gating
7. Test auto-scan.sh — first real niche scan

## Key Decisions

- **WXT framework** for cross-browser extension dev
- **Text-based detection** (not CSS classes) — LinkedIn obfuscates class names
- **Freemium via LemonSqueezy** — no server needed for license validation
- **GA4 Measurement Protocol** — privacy-first, no cookies
- **Multilingual keyword matching** — 11 languages for promoted, 7 for suggested

<!-- AUTO:GIT_LOG -->

## Recent Commits

```
17528ee auto: AI_STATUS.md, assets/screenshots/01-before-after.png, assets/screensh...
2733bb9 auto: AI_STATUS.md
9adf666 auto: AI_STATUS.md
78df21e auto: AI_STATUS.md
0cb5c04 auto: AI_STATUS.md
20d0d3f auto: AI_STATUS.md, amo-metadata.json
a229693 auto: AI_STATUS.md
66e0ace auto: AI_STATUS.md
f8d1a52 docs: update AI_STATUS.md with directory submission status
211c835 auto: .playwright-mcp/console-2026-03-28T06-14-39-301Z.log
```

<!-- /AUTO:GIT_LOG -->

<!-- AUTO:GIT_STATUS -->

## Uncommitted Changes

Branch: `master`

```
M  AI_STATUS.md
M  HANDOFF.md
```

<!-- /AUTO:GIT_STATUS -->

```

```
