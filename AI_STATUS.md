# Project Status

> Auto-updated. Read this before starting any work.
> Last updated: 2026-06-12 (v1.3.5 prepared locally)

## Goal

LinkClean — browser extension that cleans LinkedIn feed from promoted posts, suggested content, newsletter ads, polls, reshares, and video-only posts. Audience-first free product while traction is still low; monetization is deferred until usage/reviews improve.
Success = 1000+ active users and positive reviews before reintroducing any paid tier.

## In Progress

- **v1.3.5 promoted-post hotfix prepared locally (2026-06-12)** after a second FormSubmit uninstall feedback ("It didn't hide promoted posts correctly", 2026-06-12 00:37 UTC). Root cause: LinkedIn's 2026 feed DOM rewrite (`data-testid="mainFeed"`, `article[data-id="main-feed-card"]`, actor line in `p[componentkey]`) was invisible to the v1.3.4 detector — the loose label collector explicitly skipped all `<p>` content as body copy, and only ~15 of 28 locales had promoted keywords. Evidence base: open-source LinkedinSponsorBlock (Hogwai, updated 2026-05-31) modern profile selectors. Fix: (1) new-DOM containers in discovery/identity; (2) structural promoted markers `data-sponsored-tracking-url`, `data-view-tracking-scope*="sponsored"`, `data-promoted-tracking-control-name`; (3) strict-equality matching of `<p>` metadata texts (full text, direct text nodes, direct child spans) against keyword sets — catches new-DOM labels without body-copy false positives; (4) promoted/suggested keywords expanded to ~40 languages incl. CJK/Thai (substring match only for no-space scripts, length ≥ 3); (5) hiding moved from inline `style.display` to injected CSS rule on `data-linkclean-hidden` with `!important` so LinkedIn re-renders can't un-hide posts; (6) mutation handling switched from resetting debounce to 250 ms throttle (no starvation during continuous feed mutations); (7) poll filter no longer scans `innerHTML` for "poll" (organic posts mentioning polls survive). Consilium council review (run 20260612T092359, R4 audit skipped: cursor quota) flagged and we fixed: tracking-scope matching anchored to quoted `"sponsored"` token + post root only (organic `sponsored-content-follow` interactions survive); CJK matching via scope-not-length (strict equality + token match inside LinkedIn-generated `sub-description` lines only, no substring rule); NFKC + zero-width stripping in `normalizeText`; leading+trailing throttle; static CSS pre-hide rules on LinkedIn's own sponsored attrs (no ad flash). Bonus fix found by new tests: container-div label collection false positive (short organic post mentioning "sponsored" in a `div[data-urn]` container was hidden even in v1.3.4) — label elements containing body copy are now excluded. Verified: `npm test` 33/33, `npm run typecheck`, `npm run build`, `npm run zip` (manifest `version=1.3.5`), Prettier clean. Committed locally as `87bf7be`.
- **v1.3.5 submitted to all stores (2026-06-12, owner-approved)** via MiranaApps `publish.sh --all`: Chrome Web Store upload `SUCCEEDED` + publish HTTP 200, official v2 `fetchStatus` confirms `published=PUBLISHED submitted=PENDING_REVIEW version=1.3.5`; Firefox AMO validation 0 errors / 9 warnings (https://addons.mozilla.org/en-US/developers/addon/2994972/file/4847482/validation), published successfully; Edge Add-ons package uploaded and submitted for review (product `91c40340-8f47-426f-adb0-2ba51223fc92`). Git push to `origin/master` was blocked by the local permission classifier (direct default-branch push) — commit `87bf7be` is local-only until Tugelbay pushes or allows it.
- **Repo git object store was corrupted and repaired (2026-06-12)**: `git fsck` showed invalid sha1 pointers/reflog entries and `git log`/`git diff` failed. `git fetch origin --refetch` restored all objects from GitHub; local master fast-forwarded to origin/master (`97f0413 chore: make CodeRabbit advisory`); fsck now clean.
- LinkClean v1.3.4 promoted-post reliability hotfix is published on Chrome Web Store after uninstall feedback that promoted posts were not hidden correctly. Fresh CWS official `fetchStatus` reports `published=PUBLISHED`, `submitted=null`, `latest_crx_version=1.3.4`.
- Firefox AMO v1.3.4 is public/current in authenticated status (`id=6258981`, `reviewed=2026-05-12T21:46:08Z`), with `0` average daily users / `0` weekly downloads.
- Microsoft Edge Add-ons v1.3.4 was submitted after fixing MiranaApps `scripts/publish.sh` for Edge API v1.1 ApiKey auth. Upload operation `3396b617-e3fa-4fb3-bda7-fe7eaa630ce8` completed and the submit call was accepted; wait for Edge review/public listing propagation.
- Firefox AMO v1.3.3 was manually retried after the throttle window on 2026-05-01. The scheduled retry log showed AMO API `read ECONNRESET`, not a remaining throttle. The manual safe-wrapper retry completed upload + listed-version submit with validation 0 errors / 9 warnings (`https://addons.mozilla.org/en-US/developers/addon/2994972/file/4787089/validation`), but the public AMO API still reports current public version `1.3.2`, so v1.3.3 is submitted and awaiting AMO review/publication.
- Firefox AMO v1.3.3 was retried again on 2026-05-05 08:38 Asia/Qyzylorda via `powershell -ExecutionPolicy Bypass -File .\scripts\submit-firefox.ps1`. AMO returned `409 Conflict` on version creation with `_data.version: "Version 1.3.3 already exists."` This is a duplicate-version blocker, not throttle/auth failure; current action is to wait for AMO review/publication of the existing 1.3.3 submission.

- Firefox AMO v1.3.3 retry rerun on 2026-05-17 11:10 Asia/Qyzylorda. C:\Projects\LinkClean is empty, so active repo path \\wsl.localhost\Ubuntu-24.04\home\tugelbay\Projects\00-Workspace\LinkClean was used. Preflight confirmed git status; 1.3.3 ZIP artifacts were missing, npm run zip:firefox produced only 1.3.4 ZIPs. Running powershell -ExecutionPolicy Bypass -File .\scripts\submit-firefox.ps1 from repo context failed before AMO API with sanitized blocker Missing FIREFOX_JWT_ISSUER, FIREFOX_JWT_SECRET, or FIREFOX_EXTENSION_ID (no submit attempted).
- Firefox AMO v1.3.3 retry rerun on 2026-05-18 10:20 Asia/Qyzylorda in active repo \\wsl.localhost\Ubuntu-24.04\home\tugelbay\Projects\00-Workspace\LinkClean (C:\Projects\LinkClean remains empty). Preflight confirmed git status; 1.3.3 ZIP artifacts were missing and `npm run zip:firefox` again produced only 1.3.4 ZIPs. Running `powershell -ExecutionPolicy Bypass -File .\scripts\submit-firefox.ps1` failed before AMO API with sanitized blocker `Missing FIREFOX_JWT_ISSUER, FIREFOX_JWT_SECRET, or FIREFOX_EXTENSION_ID`, so AMO did not accept a new retry submission.
- Firefox AMO v1.3.3 retry rerun on 2026-05-20 03:06 Asia/Qyzylorda in active repo `\\wsl.localhost\Ubuntu-24.04\home\tugelbay\Projects\00-Workspace\LinkClean` (`C:\Projects\LinkClean` is still not a git repo). Preflight in active repo confirmed git status; `1.3.3` ZIP artifacts were missing and `npm run zip:firefox` produced only `1.3.4` ZIPs. Running `powershell -ExecutionPolicy Bypass -File .\scripts\submit-firefox.ps1` failed before AMO API with sanitized blocker `Missing FIREFOX_JWT_ISSUER, FIREFOX_JWT_SECRET, or FIREFOX_EXTENSION_ID`, so AMO did not accept a new retry submission.
- Firefox AMO v1.3.3 retry rerun on 2026-05-22 03:22 Asia/Qyzylorda in active repo `\\wsl.localhost\Ubuntu-24.04\home\tugelbay\Projects\00-Workspace\LinkClean` (`C:\Projects\LinkClean` is still empty/not a git repo). Preflight in active repo confirmed git status; `1.3.3` ZIP artifacts were missing and `npm run zip:firefox` produced only `1.3.4` ZIPs. Running `powershell -ExecutionPolicy Bypass -File .\scripts\submit-firefox.ps1` failed before AMO API with sanitized blocker `Missing FIREFOX_JWT_ISSUER, FIREFOX_JWT_SECRET, or FIREFOX_EXTENSION_ID`, so AMO did not accept a new retry submission.
- Firefox AMO v1.3.3 retry rerun on 2026-05-23 03:32 Asia/Qyzylorda in active repo `\\wsl.localhost\Ubuntu-24.04\home\tugelbay\Projects\00-Workspace\LinkClean` (`C:\Projects\LinkClean` is still empty/not a git repo). Preflight in active repo confirmed git status; `1.3.3` ZIP artifacts were missing and `npm run zip:firefox` produced only `1.3.4` ZIPs. Running `powershell -ExecutionPolicy Bypass -File .\scripts\submit-firefox.ps1` via `powershell.exe` failed before AMO API with sanitized blocker `Missing FIREFOX_JWT_ISSUER, FIREFOX_JWT_SECRET, or FIREFOX_EXTENSION_ID`, so AMO did not accept a new retry submission.
- Firefox AMO v1.3.3 retry rerun on 2026-05-25 06:53 Asia/Qyzylorda in active repo \\wsl.localhost\Ubuntu-24.04\home\tugelbay\Projects\00-Workspace\LinkClean (C:\Projects\LinkClean is not a git repo). Preflight in active repo confirmed git status and both required artifacts exist: .output/linkclean-1.3.3-firefox.zip and .output/linkclean-1.3.3-sources.zip. Running powershell -ExecutionPolicy Bypass -File .\scripts\submit-firefox.ps1 failed before AMO API with sanitized blocker Missing FIREFOX_JWT_ISSUER, FIREFOX_JWT_SECRET, or FIREFOX_EXTENSION_ID, so AMO did not accept the submission.
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
- **v1.3.3 Chrome re-submit verified (2026-04-30 15:17 Asia/Qyzylorda)**: MiranaApps `publish.sh --chrome` uploaded `.output/linkclean-1.3.3-chrome.zip` and Chrome Web Store publish API returned `Status: OK`. A fresh CWS official `fetchStatus` then confirmed `LinkClean: published=PUBLISHED submitted=PENDING_REVIEW version=1.3.3`.
- **v1.3.3 Edge retry attempted (2026-04-30 15:17 Asia/Qyzylorda)**: `scripts/submit-edge-v11.ps1` uploaded package operation `dda87669-2ae6-47d8-ad38-8d560341d300` successfully, then publish operation `53b63987-6b1c-4488-8fbd-1cc4e12d59bd` failed with `Can't publish extension as your extension submission is in progress. Please try again later.`
- **v1.3.3 Firefox retry attempted and automated (2026-04-30 15:18 Asia/Qyzylorda)**: `scripts/submit-firefox.ps1` reached AMO version creation but returned 429 throttle. One-off Windows Scheduled Task `MiranaApps-LinkClean-Firefox-1.3.3-Retry` is ready for 2026-05-01 03:55 Asia/Qyzylorda.
- **v1.3.4 promoted-post reliability hotfix prepared and submitted to all stores (2026-05-13)**: audited the LinkedIn feed detector with Claude Opus/max second opinion after FormSubmit uninstall feedback. The fix expands feed post discovery to newer LinkedIn `urn:li:*`, `data-finite-scroll-hotkey-item`, and `data-view-name="feed-full-update"` containers; detects promoted labels inside actor metadata lines, compact `div` labels, `aria-describedby`, `alt`/`title`/`aria-label`, and `data-promoted-tracking-control-name`; re-processes existing posts when lazy-loaded ad label text/attributes change; keeps sidebar label matching stricter to avoid body-copy false positives. Verified with `npm test` (`23/23`), `npm run typecheck`, targeted Prettier check, `npm run build`, `npm run zip`, zip manifest `version=1.3.4`, and `npm audit --audit-level=high` (`0` vulnerabilities). MiranaApps `publish.sh --chrome` uploaded `.output/linkclean-1.3.4-chrome.zip`; CWS publish API returned `Status: OK`; official CWS status now shows `published=PUBLISHED`, `submitted=null`, `latest_crx_version=1.3.4`. Firefox AMO status now shows current/public `1.3.4`, reviewed `2026-05-12T21:46:08Z`. Microsoft Edge Add-ons accepted the v1.3.4 submission after the publisher switched to Edge API v1.1 ApiKey auth.
- Firefox AMO uploaded via web-ext sign (waiting review)
- Dev.to article published: https://dev.to/konabayev/i-built-a-chrome-extension-to-clean-my-linkedin-feed-heres-how-541c
- 2 GitHub Awesome list PRs: best-chrome-extensions#22, awesome-productivity#228
- 28 CWS locales (en, ru, de, fr, es, tr, uk, pl, it, nl, sv, pt_BR, pt_PT, ja, ko, id, hi, ar, zh_CN, zh_TW, da, fi, no, cs, ro, hu, th, vi)
- Centralized credentials in MiranaApps/.env.shared
- Firefox AMO JWT credentials saved
- WORKFLOW_PLAN.md — full auto + semi-auto pipeline plan
- auto-scan.sh + build-extension.sh scripts created

## Next Up

1. Monitor Edge Add-ons review/public listing propagation for LinkClean **v1.3.4**.
1. Watch uninstall feedback and CWS private WAU after the v1.3.4 fix; latest private CWS funnel is `552` impressions -> `48` page views -> `63` installs -> `7` WAU.
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
