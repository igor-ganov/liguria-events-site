---
name: roadmap-and-releases
description: Keep the public roadmap (/roadmap/) and release notes (/releases/) of dovego.it true. Use at the START of any feature or user-visible change in this repo (to place it on the roadmap) and at the END, before pushing (to write the release note and move the roadmap item). Also use when plans change, a feature is dropped, or the user asks about the roadmap, changelog or release notes.
---

# Roadmap and release notes

Two public pages, built from two data files. They are promises made to readers in
three languages, so they are updated as part of the work — never afterwards.

| Page | Data | Schema |
| --- | --- | --- |
| `/roadmap/`, `/it/roadmap/`, `/ru/roadmap/` | `src/data/roadmap.json` | `src/lib/progress/roadmap-schema.ts` |
| `/releases/`, `/it/releases/`, `/ru/releases/` | `src/data/releases.json` | `src/lib/progress/releases-schema.ts` |

Both files are decoded at build time; a malformed entry fails the build.
`test/progress.test.ts` holds the rules below, `e2e/progress.spec.ts` holds the pages.

## The three moments

### 1. Starting work — put it on the roadmap

Before the first commit of a feature, find its item in `src/data/roadmap.json`.

- It exists under `next` or `later`: change `stage` to `now`.
- It does not exist: add it as `now`, with a new `id` (kebab-case, stable, never shown).
- Something on the list is being dropped or pushed back: move it to `later`, or delete it.
  A plan that changed is edited the day it changes, not left to go stale.

`title` and `note` are written in `en`, `it` and `ru`, for a reader, not for us:
what they will be able to do, not what we will build. No internal names
(no "tickets table", "crawler", "schema").

### 2. Shipping — write the release note and close the item

In the same push as the feature:

1. In `roadmap.json`: set the item's `stage` to `done` and add `shipped` (`YYYY-MM-DD`,
   the day it reaches production). `shipped` is present exactly when the stage is `done`.
2. In `releases.json`: add an entry —
   - `date`: the same day;
   - `title`, `body`: `en`, `it`, `ru`. Two sentences at most. Say what changed for
     the reader and where to find it;
   - `example`: a path on this site, starting with `/`, where the feature can be seen
     working. It is rendered in the reader's language, so it must exist in all three.
     Check it answers 200 before pushing;
   - `roadmap`: the `id` of the item it delivers, when there is one.

A feature that lands in several pushes gets its note with the push that makes it
visible, not with the first one.

### 3. Nothing to announce — say so

A refactor, a test, a fix nobody would have noticed: add this trailer to a commit
message in the push, with the reason in brackets —

    Release-Note: none (split a file that outgrew the limit)

A bare `none` without a reason does not count.

## The hook

`.claude/settings.json` runs `scripts/hooks/check-release-note.ts` before every shell
command. On a `git push` it compares the branch with `origin/main`: if files under
`src/` (other than `src/data/`) or `migrations/` changed, `releases.json` did not, and
no commit carries the trailer, the push is blocked with the instructions above.

It only runs inside Claude Code sessions. The CI jobs that commit data refreshes are
not affected, and those files are not counted as visible changes anyway.
The rule is `scripts/hooks/needs-release-note.ts`, tested in
`test/release-note-hook.test.ts`. Change the rule there, with a test, not in the shell.

## Before pushing

    bun test ./test/progress.test.ts
    bunx playwright test e2e/progress.spec.ts --project=chromium

If the servers die with `EACCES` on Windows, the default ports are inside a range
Hyper-V reserved: set `E2E_STATIC_PORT` and `E2E_OWNER_PORT` (see `e2e/test-ports.ts`).

## Wording

- Dates are formatted per language by `src/lib/progress/long-date.ts`; write ISO in the data.
- Italian and Russian are written by hand, not transliterated from English.
- The roadmap never promises a date for something not shipped.
