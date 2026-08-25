# Loop Specification

## Goal

Make LinkClean reliably hide promoted cards in LinkedIn's current
`div[role="listitem"]` feed and keep detecting promoted/suggested cards when
LinkedIn changes wrapper tags or obfuscated classes, without hiding the feed or
organic posts.

## Non-goals

- Loading or executing remote code.
- Publishing to Chrome Web Store, Edge Add-ons, or AMO.
- Building a remote selector service or adding recurring infrastructure.
- Refactoring unrelated filters, popup UI, or sidebar behavior.

## Acceptance Criteria

- [ ] `div[role="listitem"]` cards inside LinkedIn's main feed are discovered.
- [ ] A current-DOM promoted card is hidden while organic sibling cards remain.
- [ ] When known card selectors find nothing, a strict promoted/suggested
      metadata signal can recover a bounded card ancestor without ever
      returning the whole feed, navigation, sidebar, or an organic body-text
      mention.
- [ ] Dynamic changes to semantic feed attributes trigger reprocessing.
- [ ] Extension version is prepared as `1.3.7` for a later store release.
- [ ] Existing and new detector tests pass with `npm test`.

## Allowed Paths

- `src/lib/linkedin-detector.ts`
- `src/lib/linkedin-detector.test.ts`
- `src/entrypoints/linkedin-feed.content.ts`
- `package.json`
- `package-lock.json`
- `AI_STATUS.md`

## Verification

Use the pre-existing `npm test` project verifier. Run typecheck, build,
formatting and dependency audit again outside the controller before handoff.

## Stop Conditions

- Acceptance verifier passes.
- Four iterations or 45 minutes are exhausted.
- One verifier exceeds 300 seconds.
- The same failure or repository snapshot repeats twice.
- Any required edit crosses an allowed path or human gate.

## Rollback

Discard the isolated `codex/linkclean-adaptive-feed` worktree/branch only after
preserving any desired diff. The original `master` worktree and its untracked
files remain untouched.

## Human Gates

- Any store upload, submission, publication, merge, deployment, credential use,
  paid API call, or new remote service remains explicitly outside this loop.

