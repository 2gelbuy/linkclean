# Local Claude Instructions

<!-- root-claude-rules -->
@/home/tugelbay/Projects/CLAUDE.md

Root Claude rules apply first. These local notes only add project-specific context.

---

# LinkClean — LinkedIn Feed Cleaner

> Part of Mirana Apps portfolio. Parent: /home/tugelbay/Projects/MiranaApps/CLAUDE.md
> CWS knowledge: /mnt/c/Brain/Knowledge/cws-unified.md

## This Extension

- **CWS ID:** ipdckibncofmlnoaajkdhnbclbpgppdg
- **Niche:** LinkedIn feed cleaning (hide promoted, suggested, polls, reshares, newsletter ads)
- **USP:** Only extension with 28-language detection + modern UI + all filters free
- **Landing:** konabayev.com/linkclean/
- **Published:** CWS v1.0.1 (NOTE: only en locale in published CRX! 28 locales in code not published yet)

## Tech Stack

| Layer     | Technology                |
| --------- | ------------------------- |
| Framework | WXT (Manifest V3)         |
| UI        | React 18 + Tailwind CSS 3 |
| Storage   | Chrome Storage API        |
| Language  | TypeScript (strict)       |
| Icons     | Lucide React              |

## Architecture

- Text-based detection (not CSS selectors) — survives LinkedIn DOM changes
- Multilingual keyword matching (28 languages)
- MutationObserver for lazy-loaded feed posts
- Content script: 7.2KB (pure DOM)
- Popup: 145KB (React + Tailwind)
- Total CRX: 87KB compressed

## Key Files

- `src/entrypoints/linkedin-feed.content.ts` — core detection + hiding (302 lines)
- `src/entrypoints/background.ts` — badge updates
- `src/entrypoints/popup/App.tsx` — 8 filter toggles + stats
- `src/lib/filters.ts` — storage + state management

## Known Issues

- Published CRX has only 1 locale (en), code has 28 — need to re-publish
- GA4 host_permission in manifest but API secret not configured (dead permission)
- 0 tests (Vitest configured but no test files)
- No GitHub Actions CI/CD workflow

## CWS Status (2026-03-29)

- 0 reviews, 0 stars
- Title: "LinkClean - Clean LinkedIn Feed, Hide Ads & Noise"
- RECOMMENDED: Change to "LinkedIn Feed Cleaner - Hide Ads, Spam & Promoted Posts"
  (exact match for top search keyword = #1 CWS ranking factor)

## Session Context

Read `AI_STATUS.md` before starting any work. Keep it updated.
