// The push guard: a change a reader can see must arrive with a release note.
//
// It is a hook rather than a habit because the habit already failed once — the
// whole summer's work shipped with no public record of it. What matters is
// that it stops exactly the pushes that need a note and no others: a guard
// that also blocks a typo fix gets switched off within a week.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { needsReleaseNote } from '../scripts/hooks/needs-release-note.ts';

const NOTE = 'src/data/releases.json';

describe('a push needs a release note', () => {
  test('when it changes what the site does and carries none', () => {
    assert.equal(needsReleaseNote(['src/components/feed/feed-card-html.ts'], ['Feed cards go full width']), true);
  });

  test('when it changes the database', () => {
    assert.equal(needsReleaseNote(['migrations/0009_tickets.sql'], ['Tickets table']), true);
  });
});

describe('a push does not need one', () => {
  test('when the note is in the same push', () => {
    assert.equal(needsReleaseNote(['src/components/feed/feed-card-html.ts', NOTE], ['Feed cards']), false);
  });

  test('when a commit says in its own words that there is nothing to announce', () => {
    const messages = ['Split a file that outgrew the limit\n\nRelease-Note: none (refactor, no visible change)'];
    assert.equal(needsReleaseNote(['src/lib/i18n/ui-dict-schema.ts'], messages), false);
  });

  test('when only tests, docs, scripts or the roadmap changed', () => {
    const files = ['e2e/progress.spec.ts', 'test/progress.test.ts', 'specs/growth/plan.md', 'scripts/smoke.ts', 'src/data/roadmap.json', 'README.md'];
    assert.equal(needsReleaseNote(files, ['Housekeeping']), false);
  });

  test('when it is the weekly data refresh, which no reader would call a release', () => {
    assert.equal(needsReleaseNote(['public/data/landmarks/liguria.en.json'], ['Refresh landmarks']), false);
  });

  test('when nothing changed at all', () => {
    assert.equal(needsReleaseNote([], []), false);
  });
});

describe('the opt-out has to be meant', () => {
  test('a bare "none" with no reason does not count', () => {
    assert.equal(needsReleaseNote(['src/pages/roadmap.astro'], ['Tidy\n\nRelease-Note: none']), true);
  });
});
