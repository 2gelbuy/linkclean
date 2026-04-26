# Project Status

> Auto-updated. Read this before starting any work.
> Last updated: 2026-04-25 13:48

## Goal

LinkClean — Chrome extension that cleans LinkedIn feed from promoted posts, suggested content, newsletter ads, polls, reshares, and video-only posts. Freemium model via LemonSqueezy. Published on Chrome Web Store.
Success = 1000+ active users, positive reviews, Pro upgrade revenue.

## In Progress

- Firefox AMO — uploaded, waiting for review (slug: linkclean-linkedin-feed-cleane)
- Investigated version bump: repo version **1.3.0** was introduced by commit `2aa51d3` on 2026-03-31 by Tugelbay Konabayev; there is no `v1.3.0` git tag, so the standard GitHub tag-based release workflow did not publish it.

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
- Repo version bump to **1.3.0** identified in commit `2aa51d3` (`agent: auto-commit before sync`, 2026-03-31 21:15 UTC, author Tugelbay Konabayev)
- Firefox AMO uploaded via web-ext sign (waiting review)
- Dev.to article published: https://dev.to/konabayev/i-built-a-chrome-extension-to-clean-my-linkedin-feed-heres-how-541c
- 2 GitHub Awesome list PRs: best-chrome-extensions#22, awesome-productivity#228
- 28 CWS locales (en, ru, de, fr, es, tr, uk, pl, it, nl, sv, pt_BR, pt_PT, ja, ko, id, hi, ar, zh_CN, zh_TW, da, fi, no, cs, ro, hu, th, vi)
- Centralized credentials in MiranaApps/.env.shared
- Firefox AMO JWT credentials saved
- WORKFLOW_PLAN.md — full auto + semi-auto pipeline plan
- auto-scan.sh + build-extension.sh scripts created

## Next Up

1. Edge Add-ons credentials + submission
2. Confirm whether the live CWS `1.3.0` publish used local `publish.sh` / manual CWS upload path and document the exact release path
3. Sync scripts to VPS + set up daily cron for auto-scan
4. Telegram notifications (need chat_id)
5. Register on: Hashnode, ProductHunt, AlternativeTo, SaaSHub (manual Google OAuth)
6. GA4 API secret
7. LemonSqueezy product setup + Pro features gating
8. Test auto-scan.sh — first real niche scan

## Key Decisions

- **WXT framework** for cross-browser extension dev
- **Text-based detection** (not CSS classes) — LinkedIn obfuscates class names
- **Freemium via LemonSqueezy** — no server needed for license validation
- **GA4 Measurement Protocol** — privacy-first, no cookies
- **Multilingual keyword matching** — 11 languages for promoted, 7 for suggested

<!-- AUTO:GIT_LOG -->

## Recent Commits

```
f9fd0b3 auto: AI_STATUS.md, HANDOFF.md, .env.submit, store/
7d1bedf feat(analytics): add PostHog tracking to popup
23b74bb fix: English extName/extDesc in all 27 locales for CWS discoverability
8987c51 ci: add multi-store release workflow (Chrome + Firefox + Edge)
86e5471 chore: remove sync test file
eac8ab6 test: paperclip sync verification
2aa51d3 agent: auto-commit before sync
0909df1 fix: CWS policy compliance â€” replace Hide with Filter, add LemonSqueezy host_permission
f6df4a7 agent: auto-commit before sync
340ce77 agent: auto-commit before sync
```

<!-- /AUTO:GIT_LOG -->

<!-- AUTO:GIT_STATUS -->

## Uncommitted Changes

Branch: `master`
_Clean working tree._

<!-- /AUTO:GIT_STATUS -->

```

```
