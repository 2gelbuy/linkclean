# Project Status

> Auto-updated. Read this before starting any work.
> Last updated: 2026-04-30 09:15

## Goal

LinkClean — browser extension that cleans LinkedIn feed from promoted posts, suggested content, newsletter ads, polls, reshares, and video-only posts. Audience-first free product while traction is still low; monetization is deferred until usage/reviews improve.
Success = 1000+ active users and positive reviews before reintroducing any paid tier.

## In Progress

- LinkClean v1.3.3 layout-safety hotfix submitted to Chrome Web Store and Microsoft Edge Add-ons on 2026-04-30; Firefox AMO submission is blocked by API throttle until roughly 2026-04-30 21:50 UTC / 2026-05-01 02:50 Asia/Qyzylorda.
- LinkClean v1.3.2 submitted to Chrome Web Store, Firefox AMO, and Microsoft Edge Add-ons on 2026-04-28; waiting for store review/propagation.
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
- **v1.3.2 audience-first cleanup prepared locally (2026-04-28)** after live smoke testing: all PRO/paywall UI was removed from the popup, all filters are available for free, LemonSqueezy host permission was removed, PostHog was removed from the popup because it loaded remote `config.js`/`surveys.js`, and a new Codex `image_gen` icon was generated and copied into `assets/icon-raw.png` plus `src/public/icon/{16,32,48,128}.png`.
- The promoted-post reliability fixes remain in v1.3.2: extracted a testable LinkedIn feed detector, added `Sponsored`/aria-label/sidebar ad-label detection, added semantic `article`/`data-urn` post discovery, and changed mutation handling to re-check existing posts when LinkedIn lazy-loads labels. Right sidebar ads are free and constrained to the right rail so they do not hide the left profile/about-me column.
- Also applied `npm audit fix` patch-level dev-tooling updates (`wxt` lockfile 0.20.20 -> 0.20.25, Vite 8.0.2 -> 8.0.10) to clear high-severity audit findings.
- **v1.3.2 submitted to all stores (2026-04-28)**: Chrome Web Store upload/publish API returned OK for extension `ipdckibncofmlnoaajkdhnbclbpgppdg`; Firefox AMO accepted the listed submission with validation result 0 errors / 9 warnings (`https://addons.mozilla.org/en-US/developers/addon/2994972/file/4783244/validation`); Microsoft Edge Add-ons API v1.1 accepted package upload operation `958c355a-77de-4ed8-ae81-9acda7a867d0` and publish operation `6d559182-96ca-4fb1-8b01-ac96413ea391`.
- **v1.3.3 layout-safety hotfix prepared locally (2026-04-30)**: content script now only mutates LinkedIn `/feed`, restores only elements LinkClean hid, preserves previous inline `display`, re-checks after SPA path changes, avoids generic profile/about/sidebar articles as feed posts, and no longer treats normal jobs/premium links as sidebar ads without promo labels. Regression tests were added for profile articles, sidebar content, non-feed paths, organic `suggested` text, and normal jobs links.
- **v1.3.3 submitted to Chrome and Edge (2026-04-30)**: Chrome Web Store `wxt submit` completed upload + submit-for-review successfully; Microsoft Edge Add-ons API v1.1 accepted package upload operation `b33ef930-8365-47af-8b64-d4fd976960e6` and publish operation `69bb5560-6623-4c0a-99d2-a2b72a9010ad`. Firefox AMO returned 429 throttle during version creation (`Expected available in 63167 seconds`), so Firefox retry is pending.
- Firefox AMO uploaded via web-ext sign (waiting review)
- Dev.to article published: https://dev.to/konabayev/i-built-a-chrome-extension-to-clean-my-linkedin-feed-heres-how-541c
- 2 GitHub Awesome list PRs: best-chrome-extensions#22, awesome-productivity#228
- 28 CWS locales (en, ru, de, fr, es, tr, uk, pl, it, nl, sv, pt_BR, pt_PT, ja, ko, id, hi, ar, zh_CN, zh_TW, da, fi, no, cs, ro, hu, th, vi)
- Centralized credentials in MiranaApps/.env.shared
- Firefox AMO JWT credentials saved
- WORKFLOW_PLAN.md — full auto + semi-auto pipeline plan
- auto-scan.sh + build-extension.sh scripts created

## Next Up

1. Retry Firefox AMO submission for LinkClean **v1.3.3** after 2026-05-01 02:50 Asia/Qyzylorda, then monitor all stores for review/propagation.
1. Monitor Chrome Web Store, Firefox AMO, and Microsoft Edge Add-ons review/propagation for LinkClean **v1.3.2**; confirm public store pages show the new version after approval.
1. Handle Firefox `data_collection_permissions` before the next AMO policy deadline; current build warning says future submissions may require it.
1. Confirm whether the live CWS `1.3.0` publish used local `publish.sh` / manual CWS upload path and document the exact release path.
1. Sync scripts to VPS + set up daily cron for auto-scan.
1. Telegram notifications (need chat_id).
1. Register on: Hashnode, ProductHunt, AlternativeTo, SaaSHub (manual Google OAuth).
1. GA4 API secret.
1. Revisit monetization only after traction/reviews improve; no visible Pro/paywall in v1.3.2.
1. Test auto-scan.sh — first real niche scan.

## Key Decisions

- **WXT framework** for cross-browser extension dev
- **Text-based detection** (not CSS classes) — LinkedIn obfuscates class names
- **Audience-first monetization** — no visible Pro/paywall in v1.3.2; revisit paid tier only after meaningful traction
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
